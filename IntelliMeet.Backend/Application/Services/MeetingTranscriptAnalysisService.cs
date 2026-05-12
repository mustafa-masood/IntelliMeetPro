using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Serialization;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.Exceptions;
using IntelliMeet.Backend.Application.Integration;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;
using IntelliMeet.Backend.Infrastructure.Ollama;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Application.Services;

public sealed class MeetingTranscriptAnalysisService : IMeetingTranscriptAnalysisService
{
    public const string OllamaActionSource = "ollama";

    private static readonly ConcurrentDictionary<Guid, SemaphoreSlim> MeetingLocks = new();

    private readonly IMeetingRepository _meetings;
    private readonly IUserRepository _users;
    private readonly IWorkspaceRepository _workspaces;
    private readonly IMeetingSummaryRepository _summaries;
    private readonly IKeyPointRepository _keyPoints;
    private readonly IActionItemRepository _actionItems;
    private readonly ITranscriptTextResolver _transcriptText;
    private readonly IMeetingBaasClient _meetingBaas;
    private readonly IMeetingBotRepository _bots;
    private readonly IOllamaChatCompletionsClient _ollama;
    private readonly ReliabilityOptions _reliability;
    private readonly RagOptions _ragOptions;
    private readonly IMeetingRagIndexerService _ragIndexer;
    private readonly IUsageEntitlementService _usage;
    private readonly ILogger<MeetingTranscriptAnalysisService> _logger;

    public MeetingTranscriptAnalysisService(
        IMeetingRepository meetings,
        IUserRepository users,
        IWorkspaceRepository workspaces,
        IMeetingSummaryRepository summaries,
        IKeyPointRepository keyPoints,
        IActionItemRepository actionItems,
        ITranscriptTextResolver transcriptText,
        IMeetingBaasClient meetingBaas,
        IMeetingBotRepository bots,
        IOllamaChatCompletionsClient ollama,
        IOptions<ReliabilityOptions> reliability,
        IOptions<RagOptions> ragOptions,
        IMeetingRagIndexerService ragIndexer,
        IUsageEntitlementService usage,
        ILogger<MeetingTranscriptAnalysisService> logger)
    {
        _meetings = meetings;
        _users = users;
        _workspaces = workspaces;
        _summaries = summaries;
        _keyPoints = keyPoints;
        _actionItems = actionItems;
        _transcriptText = transcriptText;
        _meetingBaas = meetingBaas;
        _bots = bots;
        _ollama = ollama;
        _reliability = reliability.Value;
        _ragOptions = ragOptions.Value;
        _ragIndexer = ragIndexer;
        _usage = usage;
        _logger = logger;
    }

    public async Task AnalyzeAndPersistAsync(Guid meetingId, bool force, CancellationToken ct)
    {
        var gate = MeetingLocks.GetOrAdd(meetingId, _ => new SemaphoreSlim(1, 1));
        await gate.WaitAsync(ct).ConfigureAwait(false);
        try
        {
            await AnalyzeCoreAsync(meetingId, force, ct).ConfigureAwait(false);
        }
        finally
        {
            gate.Release();
        }
    }

    private async Task AnalyzeCoreAsync(Guid meetingId, bool force, CancellationToken ct)
    {
        var meeting = _meetings.GetById(meetingId) ?? throw new KeyNotFoundException("Meeting not found.");
        if (meeting.TranscriptAnalysisCompleted && !force)
        {
            _logger.LogDebug("Skip Ollama analysis for meeting {MeetingId}: already completed.", meetingId);
            return;
        }

        if (meeting.OrganizerUserId is Guid orgId)
        {
            var org = _users.GetTrackedById(orgId);
            if (org is not null)
            {
                var ent = _usage.CanRunMeetingAnalysis(org);
                if (!ent.ok)
                {
                    FailMeeting(meeting, ent.message ?? "Plan limit exceeded.");
                    throw new InvalidOperationException(ent.message ?? ent.code);
                }
            }
        }

        if (force)
        {
            meeting.TranscriptAnalysisCompleted = false;
            meeting.RagIndexedAtUtc = null;
        }

        var plain = await ResolveTranscriptWithRetryAsync(meetingId, ct).ConfigureAwait(false);
        if (string.IsNullOrWhiteSpace(plain))
        {
            MeetingDomainStateMachine.MarkAwaitingTranscript(meeting, DateTimeOffset.UtcNow);
            meeting.AnalysisError = "Transcript text is not available yet.";
            _meetings.Upsert(meeting);
            throw new TranscriptNotReadyException(meeting.AnalysisError);
        }

        MeetingDomainStateMachine.MarkAnalyzingTranscript(meeting, DateTimeOffset.UtcNow);
        _meetings.Upsert(meeting);

        var meetingDate = (meeting.StartUtc ?? DateTimeOffset.UtcNow).ToString("yyyy-MM-dd");
        var system = BuildSystemPrompt(meetingDate);
        var mbJson = await BuildMeetingBaasMetadataJsonAsync(meeting, ct).ConfigureAwait(false);
        var user = "MEETING_BAAS_METADATA (JSON; artifact presigned URLs omitted — use only for context; spoken content is in the transcript):\n"
                   + mbJson
                   + "\n\nINPUT TRANSCRIPT:\n\n"
                   + plain;

        string rawJson;
        try
        {
            rawJson = await _ollama.CompleteAsync(system, user, ct).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ollama completion failed for meeting {MeetingId}", meetingId);
            FailMeeting(meeting, ex.Message);
            throw;
        }

        var json = UnwrapMarkdownFence(rawJson);
        OllamaAnalysisDto? dto = TryDeserialize(json);
        if (dto is null)
        {
            _logger.LogWarning("Ollama JSON parse failed; retrying with stricter instructions for meeting {MeetingId}", meetingId);
            try
            {
                rawJson = await _ollama.CompleteAsync(BuildRetrySystemPrompt(meetingDate), user, ct).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ollama retry completion failed for meeting {MeetingId}", meetingId);
                FailMeeting(meeting, ex.Message);
                throw;
            }

            json = UnwrapMarkdownFence(rawJson);
            dto = TryDeserialize(json);
        }

        if (dto is null)
        {
            FailMeeting(meeting, "Ollama returned JSON that could not be parsed after retry.");
            throw new InvalidOperationException(meeting.AnalysisError);
        }

        var now = DateTimeOffset.UtcNow;
        _actionItems.RemoveByMeetingIdAndSource(meetingId, OllamaActionSource);

        var existing = _summaries.GetByMeetingId(meetingId);
        var summaryId = existing?.Id ?? Guid.NewGuid();
        _summaries.Upsert(new MeetingSummary
        {
            Id = summaryId,
            MeetingId = meetingId,
            ShortSummary = dto.Summary?.Trim() ?? string.Empty,
            StructuredSections = Array.Empty<string>(),
            Decisions = dto.Decisions?.Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s.Trim()).ToList() ?? new List<string>(),
            Risks = dto.Risks?.Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s.Trim()).ToList() ?? new List<string>(),
            UpdatedAt = now
        });

        var kps = (dto.KeyPoints ?? new List<string>())
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Select((text, i) => new KeyPoint
            {
                Id = Guid.NewGuid(),
                MeetingId = meetingId,
                Order = i,
                Text = text.Trim()
            })
            .ToList();
        _keyPoints.ReplaceForMeeting(meetingId, kps);

        IReadOnlyList<User> workspaceUsers = Array.Empty<User>();
        if (meeting.WorkspaceId is Guid ws && ws != Guid.Empty)
        {
            workspaceUsers = _workspaces.ListMembers(ws)
                .Select(m => _users.GetById(m.UserId))
                .Where(u => u is not null)
                .Cast<User>()
                .ToList();
        }

        foreach (var a in dto.ActionItems ?? new List<OllamaActionItemDto>())
        {
            var title = !string.IsNullOrWhiteSpace(a.Title) ? a.Title.Trim() : a.Description?.Trim();
            if (string.IsNullOrWhiteSpace(title))
                continue;
            var due = ParseDue(a.DueDate, meetingDate);
            var owner = string.IsNullOrWhiteSpace(a.Owner) ? null : a.Owner.Trim();
            if (string.Equals(owner, "null", StringComparison.OrdinalIgnoreCase))
                owner = null;
            var assign = ResolveAssignee(owner, workspaceUsers);
            _actionItems.Upsert(new ActionItem
            {
                Id = Guid.NewGuid(),
                MeetingId = meetingId,
                WorkspaceId = meeting.WorkspaceId,
                Title = title,
                Description = string.IsNullOrWhiteSpace(a.Description) ? null : a.Description.Trim(),
                Owner = owner,
                DueDate = due,
                Priority = ParsePriority(a.Priority),
                Status = string.IsNullOrWhiteSpace(a.Status) ? "open" : a.Status.Trim().ToLowerInvariant(),
                AddToTodoChecked = false,
                LinkedTodoItemId = null,
                Source = OllamaActionSource,
                AssignedUserId = assign.AssignedId,
                SuggestedAssigneeName = assign.SuggestedName,
                SuggestedAssigneeConfidence = assign.Confidence
            });
        }

        MeetingDomainStateMachine.MarkAnalysisComplete(meeting, now);
        _meetings.Upsert(meeting);
        if (meeting.OrganizerUserId is Guid orgId2)
        {
            var org = _users.GetTrackedById(orgId2);
            if (org is not null)
            {
                _usage.RecordMeetingAnalysis(org);
                _users.Upsert(org);
            }
        }
        if (_ragOptions.EnableIndexing)
        {
            try
            {
                await _ragIndexer.IndexMeetingTranscriptAsync(meetingId, plain, force, ct).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                // TODO(Mustafa): decide whether RAG indexing failures should be retried out-of-band instead of inline logging.
                _logger.LogWarning(ex, "RAG indexing failed for meeting {MeetingId}; core analysis remains successful", meetingId);
            }
        }

        _logger.LogInformation("Ollama analysis persisted for meeting {MeetingId}", meetingId);
    }

    private void FailMeeting(Meeting meeting, string message)
    {
        MeetingDomainStateMachine.MarkAnalysisFailed(meeting, message, DateTimeOffset.UtcNow);
        _meetings.Upsert(meeting);
    }

    private async Task<string?> ResolveTranscriptWithRetryAsync(Guid meetingId, CancellationToken ct)
    {
        var maxAttempts = Math.Clamp(_reliability.TranscriptResolveMaxAttempts, 1, 10);
        var delayMs = Math.Clamp(_reliability.TranscriptResolveInitialDelayMs, 250, 20000);
        var factor = Math.Clamp(_reliability.TranscriptResolveBackoffFactor, 1.0, 4.0);
        var delay = TimeSpan.FromMilliseconds(delayMs);

        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                var plain = await _transcriptText.ResolvePlainTextAsync(meetingId, ct).ConfigureAwait(false);
                if (!string.IsNullOrWhiteSpace(plain))
                    return plain;
            }
            catch (Exception ex) when (attempt < maxAttempts)
            {
                _logger.LogWarning(ex, "Transcript resolve attempt {Attempt}/{MaxAttempts} failed for meeting {MeetingId}", attempt, maxAttempts, meetingId);
            }

            if (attempt >= maxAttempts)
                break;

            _logger.LogInformation(
                "Transcript not ready for meeting {MeetingId}; retrying in {DelayMs}ms (attempt {Attempt}/{MaxAttempts})",
                meetingId,
                (int)delay.TotalMilliseconds,
                attempt + 1,
                maxAttempts);
            await Task.Delay(delay, ct).ConfigureAwait(false);
            delay = TimeSpan.FromMilliseconds(Math.Clamp((int)(delay.TotalMilliseconds * factor), 250, 30000));
        }

        return null;
    }

    private readonly record struct AssigneeResolution(Guid? AssignedId, string? SuggestedName, float? Confidence);

    private static AssigneeResolution ResolveAssignee(string? owner, IReadOnlyList<User> members)
    {
        if (string.IsNullOrWhiteSpace(owner))
            return new AssigneeResolution(null, null, null);
        var o = owner.Trim();
        foreach (var u in members)
        {
            if (!string.IsNullOrWhiteSpace(u.DisplayName) &&
                string.Equals(u.DisplayName, o, StringComparison.OrdinalIgnoreCase))
                return new AssigneeResolution(u.Id, o, 0.8f);
            var local = u.Email.Split('@')[0];
            if (string.Equals(local, o, StringComparison.OrdinalIgnoreCase))
                return new AssigneeResolution(u.Id, o, 0.75f);
            if (string.Equals(u.Email, o, StringComparison.OrdinalIgnoreCase))
                return new AssigneeResolution(u.Id, o, 0.85f);
        }

        User? fuzzy = null;
        foreach (var u in members)
        {
            if (string.IsNullOrWhiteSpace(u.DisplayName)) continue;
            if (u.DisplayName.Contains(o, StringComparison.OrdinalIgnoreCase) ||
                o.Contains(u.DisplayName, StringComparison.OrdinalIgnoreCase))
            {
                fuzzy = u;
                break;
            }
        }

        if (fuzzy is not null)
            return new AssigneeResolution(null, fuzzy.DisplayName, 0.4f);
        return new AssigneeResolution(null, o, null);
    }

    private static ActionItemPriority ParsePriority(string? p)
    {
        if (string.IsNullOrWhiteSpace(p))
            return ActionItemPriority.Medium;
        return p.Trim().ToLowerInvariant() switch
        {
            "low" => ActionItemPriority.Low,
            "high" => ActionItemPriority.High,
            _ => ActionItemPriority.Medium
        };
    }

    private async Task<string> BuildMeetingBaasMetadataJsonAsync(Meeting meeting, CancellationToken ct)
    {
        // Keep Meeting BaaS fan-out small so analysis queue workers do not stall the pipeline.
        const int maxListPages = 1;
        const int maxListRows = 24;

        var v2GetBotDetails = new List<object>();
        var v2GetScheduledBotDetails = new List<object>();
        var v2ListBots = new List<object>();
        var v2ListScheduledBots = new List<object>();

        try
        {
            foreach (var bot in _bots.GetByMeetingId(meeting.Id))
            {
                if (string.IsNullOrWhiteSpace(bot.ExternalBotId))
                    continue;

                var det = await _meetingBaas.GetBotAsync(bot.ExternalBotId, ct).ConfigureAwait(false);
                if (det.Success && det.Data is not null)
                    v2GetBotDetails.Add(SanitizeBotDetails(det.Data));

                if (bot.IsScheduled)
                {
                    var sch = await _meetingBaas.GetScheduledBotDetailsAsync(bot.ExternalBotId, ct).ConfigureAwait(false);
                    if (sch.Success && sch.Data is not null)
                        v2GetScheduledBotDetails.Add(SanitizeScheduledBotDetails(sch.Data));
                }
            }

            if (!string.IsNullOrWhiteSpace(meeting.MeetingUrl))
            {
                var seenBotIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                string? cursor = null;
                for (var page = 0; page < maxListPages && v2ListBots.Count < maxListRows; page++)
                {
                    var pageRes = await _meetingBaas
                        .ListBotsAsync(new ListBotsQuery(Limit: 50, Cursor: cursor, MeetingUrl: meeting.MeetingUrl), ct)
                        .ConfigureAwait(false);
                    if (!pageRes.Success || pageRes.Data is null)
                        break;
                    foreach (var it in pageRes.Data.Items)
                    {
                        if (string.IsNullOrWhiteSpace(it.BotId) || !seenBotIds.Add(it.BotId))
                            continue;
                        v2ListBots.Add(SanitizeBotListItem(it));
                        if (v2ListBots.Count >= maxListRows)
                            break;
                    }

                    cursor = pageRes.Data.NextCursor;
                    if (string.IsNullOrEmpty(cursor))
                        break;
                }

                var seenSchedIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                cursor = null;
                for (var page = 0; page < maxListPages && v2ListScheduledBots.Count < maxListRows; page++)
                {
                    var pageRes = await _meetingBaas
                        .ListScheduledBotsAsync(
                            new ListScheduledBotsQuery(Limit: 50, Cursor: cursor, MeetingUrl: meeting.MeetingUrl), ct)
                        .ConfigureAwait(false);
                    if (!pageRes.Success || pageRes.Data is null)
                        break;
                    foreach (var it in pageRes.Data.Items)
                    {
                        if (string.IsNullOrWhiteSpace(it.BotId) || !seenSchedIds.Add(it.BotId))
                            continue;
                        v2ListScheduledBots.Add(SanitizeScheduledListItem(it));
                        if (v2ListScheduledBots.Count >= maxListRows)
                            break;
                    }

                    cursor = pageRes.Data.NextCursor;
                    if (string.IsNullOrEmpty(cursor))
                        break;
                }
            }

            var payload = new
            {
                app_meeting = new
                {
                    meeting.Title,
                    meeting.Platform,
                    meeting.StartUtc,
                    meeting.EndUtc,
                    meeting.Participants
                },
                v2_get_bot_details = v2GetBotDetails,
                v2_get_scheduled_bot_details = v2GetScheduledBotDetails,
                v2_list_bots = v2ListBots,
                v2_list_scheduled_bots = v2ListScheduledBots
            };

            return JsonSerializer.Serialize(payload, MetaJsonOpts);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Meeting BaaS metadata fetch for Ollama failed; continuing with transcript only");
            return JsonSerializer.Serialize(new { error = "meeting_baas_metadata_unavailable", detail = ex.Message }, MetaJsonOpts);
        }
    }

    private static object SanitizeBotDetails(BotDetailsData d) => new
    {
        d.BotId,
        d.BotName,
        d.Status,
        d.MeetingPlatform,
        d.MeetingUrl,
        d.RecordingMode,
        d.DurationSeconds,
        d.CreatedAt,
        d.UpdatedAt,
        d.JoinedAt,
        d.ExitedAt,
        d.ArtifactsDeleted,
        d.TranscriptionProvider,
        d.TranscriptionIds,
        participants = d.Participants?.Select(PersonLabel).Where(s => !string.IsNullOrWhiteSpace(s)).ToList(),
        speakers = d.Speakers?.Select(PersonLabel).Where(s => !string.IsNullOrWhiteSpace(s)).ToList(),
        has_video_artifact = !string.IsNullOrEmpty(d.Video),
        has_audio_artifact = !string.IsNullOrEmpty(d.Audio),
        has_transcription_artifact = !string.IsNullOrEmpty(d.Transcription),
        has_raw_transcription_artifact = !string.IsNullOrEmpty(d.RawTranscription),
        has_diarization_artifact = !string.IsNullOrEmpty(d.Diarization),
        has_chat_messages_artifact = !string.IsNullOrEmpty(d.ChatMessages),
        d.ErrorCode,
        d.ErrorMessage,
        extra_json = JsonElementRaw(d.Extra),
        tokens_json = JsonElementRaw(d.Tokens),
        zoom_config_json = JsonElementRaw(d.ZoomConfig)
    };

    private static object SanitizeScheduledBotDetails(ScheduledBotDetailsData s) => new
    {
        s.BotId,
        s.BotName,
        s.MeetingUrl,
        s.MeetingPlatform,
        s.RecordingMode,
        s.JoinAt,
        s.Status,
        s.CreatedAt,
        s.UpdatedAt,
        s.CancelledAt,
        s.AllowMultipleBots,
        s.EntryMessage,
        transcription_config_json = JsonElementRaw(s.TranscriptionConfig),
        extra_json = JsonElementRaw(s.Extra),
        has_bot_image = !string.IsNullOrEmpty(s.BotImage)
    };

    private static object SanitizeBotListItem(BotListItemData it) => new
    {
        it.BotId,
        it.BotName,
        it.MeetingUrl,
        it.MeetingPlatform,
        it.Status,
        it.Duration,
        it.CreatedAt,
        it.EndedAt,
        it.JoinedAt,
        it.ExitedAt,
        it.ErrorCode,
        it.ErrorMessage,
        extra_json = JsonElementRaw(it.Extra),
        tokens_json = JsonElementRaw(it.Tokens)
    };

    private static object SanitizeScheduledListItem(ScheduledBotListItemData it) => new
    {
        it.BotId,
        it.BotName,
        it.MeetingUrl,
        it.MeetingPlatform,
        it.JoinAt,
        it.Status,
        it.CreatedAt,
        it.UpdatedAt,
        extra_json = JsonElementRaw(it.Extra)
    };

    private static string? JsonElementRaw(JsonElement? el)
    {
        if (el is not { } e || e.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
            return null;
        return e.GetRawText();
    }

    private static string? PersonLabel(MbPersonRefData? p)
    {
        if (p is null)
            return null;
        var s = !string.IsNullOrWhiteSpace(p.DisplayName) ? p.DisplayName : p.Name;
        if (!string.IsNullOrWhiteSpace(s))
            return s.Trim();
        return p.Id?.ToString();
    }

    private static readonly JsonSerializerOptions MetaJsonOpts = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        WriteIndented = false
    };

    private static string BuildSystemPrompt(string meetingDate) =>
        """
        You are an expert meeting analyst. You will receive a meeting transcript (optionally with [Speaker] lines).

        Return ONLY a valid JSON object with EXACTLY these fields (no markdown fences, no commentary):
        {
          "summary": "string",
          "keyPoints": ["string"],
          "actionItems": [
            {
              "title": "string",
              "description": "string",
              "owner": "string or null",
              "dueDate": "YYYY-MM-DD or null",
              "priority": "Low|Medium|High",
              "status": "Open"
            }
          ],
          "decisions": ["string"],
          "risks": ["string"]
        }

        Rules:
        - summary: 2–5 sentences, factual, based on the transcript.
        - keyPoints: concise bullets of important discussion points.
        - actionItems: only explicit or strongly implied tasks; omit empty shells.
        - decisions: explicit decisions/commitments if any; else [].
        - risks: blockers/concerns if any; else [].
        - dueDate: use YYYY-MM-DD when stated; otherwise null (do NOT invent dates).
        - If no action items, return "actionItems": [].

        MEETING_DATE_CONTEXT (YYYY-MM-DD, for interpreting relative dates only): 
        """ + meetingDate;

    private static string BuildRetrySystemPrompt(string meetingDate) =>
        BuildSystemPrompt(meetingDate)
        + "\n\nSTRICT_RETRY: Your previous output was rejected. Output ONLY compact JSON matching the schema. No trailing commas. No NaN. Use null not \"null\" for missing strings.";

    private static string UnwrapMarkdownFence(string content)
    {
        var t = content.Trim();
        if (!t.StartsWith("```", StringComparison.Ordinal))
            return t;
        var firstNl = t.IndexOf('\n');
        var last = t.LastIndexOf("```", StringComparison.Ordinal);
        if (firstNl < 0 || last <= firstNl)
            return t;
        return t[(firstNl + 1)..last].Trim();
    }

    private static DateTimeOffset? ParseDue(string? due, string fallbackYmd)
    {
        if (string.IsNullOrWhiteSpace(due) || string.Equals(due, "null", StringComparison.OrdinalIgnoreCase))
            return null;

        if (DateOnly.TryParse(due.Trim(), out var parsed))
            return new DateTimeOffset(parsed.Year, parsed.Month, parsed.Day, 0, 0, 0, TimeSpan.Zero);
        if (DateOnly.TryParse(fallbackYmd, out var fb))
            return new DateTimeOffset(fb.Year, fb.Month, fb.Day, 0, 0, 0, TimeSpan.Zero);
        return null;
    }

    private static OllamaAnalysisDto? TryDeserialize(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<OllamaAnalysisDto>(json, JsonOptions);
        }
        catch
        {
            return null;
        }
    }

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true
    };

    private sealed class OllamaAnalysisDto
    {
        [JsonPropertyName("summary")]
        public string? Summary { get; set; }

        [JsonPropertyName("keyPoints")]
        public List<string>? KeyPoints { get; set; }

        [JsonPropertyName("actionItems")]
        public List<OllamaActionItemDto>? ActionItems { get; set; }

        [JsonPropertyName("decisions")]
        public List<string>? Decisions { get; set; }

        [JsonPropertyName("risks")]
        public List<string>? Risks { get; set; }
    }

    private sealed class OllamaActionItemDto
    {
        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("owner")]
        public string? Owner { get; set; }

        [JsonPropertyName("dueDate")]
        public string? DueDate { get; set; }

        [JsonPropertyName("priority")]
        public string? Priority { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }
    }
}
