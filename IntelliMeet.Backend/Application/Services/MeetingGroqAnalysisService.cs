using System.Text.Json;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Application.Integration;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.Services;

public sealed class MeetingGroqAnalysisService : IMeetingGroqAnalysisService
{
    public const string GroqActionSource = "groq";

    private readonly IMeetingRepository _meetings;
    private readonly IMeetingSummaryRepository _summaries;
    private readonly IKeyPointRepository _keyPoints;
    private readonly IActionItemRepository _actionItems;
    private readonly ITranscriptTextResolver _transcriptText;
    private readonly IMeetingBaasClient _meetingBaas;
    private readonly IMeetingBotRepository _bots;
    private readonly IGroqChatService _groq;
    private readonly ILogger<MeetingGroqAnalysisService> _logger;

    public MeetingGroqAnalysisService(
        IMeetingRepository meetings,
        IMeetingSummaryRepository summaries,
        IKeyPointRepository keyPoints,
        IActionItemRepository actionItems,
        ITranscriptTextResolver transcriptText,
        IMeetingBaasClient meetingBaas,
        IMeetingBotRepository bots,
        IGroqChatService groq,
        ILogger<MeetingGroqAnalysisService> logger)
    {
        _meetings = meetings;
        _summaries = summaries;
        _keyPoints = keyPoints;
        _actionItems = actionItems;
        _transcriptText = transcriptText;
        _meetingBaas = meetingBaas;
        _bots = bots;
        _groq = groq;
        _logger = logger;
    }

    public async Task AnalyzeAndPersistAsync(Guid meetingId, CancellationToken ct)
    {
        var meeting = _meetings.GetById(meetingId) ?? throw new KeyNotFoundException("Meeting not found.");

        var transcriptText = await _transcriptText.ResolvePlainTextAsync(meetingId, ct).ConfigureAwait(false);
        if (string.IsNullOrWhiteSpace(transcriptText))
            throw new InvalidOperationException("No transcript text is available yet. Wait for Meeting BaaS transcription, then sync or open the meeting again.");

        var meetingDate = (meeting.StartUtc ?? DateTimeOffset.UtcNow).ToString("yyyy-MM-dd");
        var systemPrompt = BuildSystemPrompt(meetingDate);
        var meetingBaasContextJson = await BuildMeetingBaasMetadataJsonAsync(meeting, ct).ConfigureAwait(false);
        var userContent = "MEETING_BAAS_METADATA (JSON; artifact presigned URLs omitted — use only for context; spoken content is in the transcript):\n"
                          + meetingBaasContextJson
                          + "\n\nINPUT TRANSCRIPT:\n\n"
                          + transcriptText;

        string rawJson;
        try
        {
            rawJson = await _groq.CompleteJsonAsync(systemPrompt, userContent, ct).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Groq completion failed for meeting {MeetingId}", meetingId);
            throw;
        }

        var json = UnwrapMarkdownFence(rawJson);
        GroqAnalysisDto? dto;
        try
        {
            dto = JsonSerializer.Deserialize<GroqAnalysisDto>(json, JsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Groq JSON parse failed for meeting {MeetingId}. Snippet: {Snippet}", meetingId, json.Length > 240 ? json[..240] : json);
            throw new InvalidOperationException("Groq returned JSON that could not be parsed.");
        }

        if (dto is null)
            throw new InvalidOperationException("Groq analysis payload was empty.");

        var now = DateTimeOffset.UtcNow;
        _actionItems.RemoveByMeetingIdAndSource(meetingId, GroqActionSource);

        var existing = _summaries.GetByMeetingId(meetingId);
        var summaryId = existing?.Id ?? Guid.NewGuid();
        _summaries.Upsert(new MeetingSummary
        {
            Id = summaryId,
            MeetingId = meetingId,
            ShortSummary = dto.Summary?.Trim() ?? string.Empty,
            StructuredSections = Array.Empty<string>(),
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

        foreach (var actionItem in dto.ActionItems ?? new List<GroqActionItemDto>())
        {
            if (string.IsNullOrWhiteSpace(actionItem.Task))
                continue;
            var due = ParseDue(actionItem.DueDate, meetingDate);
            var owner = string.IsNullOrWhiteSpace(actionItem.Owner) ? null : actionItem.Owner.Trim();
            if (string.Equals(owner, "null", StringComparison.OrdinalIgnoreCase))
                owner = null;
            _actionItems.Upsert(new ActionItem
            {
                Id = Guid.NewGuid(),
                MeetingId = meetingId,
                Title = actionItem.Task.Trim(),
                Description = null,
                Owner = owner,
                DueDate = due,
                Priority = ActionItemPriority.Medium,
                Status = "open",
                AddToTodoChecked = false,
                LinkedTodoItemId = null,
                Source = GroqActionSource
            });
        }

        _logger.LogInformation("Groq analysis persisted for meeting {MeetingId}", meetingId);
    }

    private async Task<string> BuildMeetingBaasMetadataJsonAsync(Meeting meeting, CancellationToken ct)
    {
        const int maxListPages = 5;
        const int maxListRows = 60;

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
                    foreach (var item in pageRes.Data.Items)
                    {
                        if (string.IsNullOrWhiteSpace(item.BotId) || !seenBotIds.Add(item.BotId))
                            continue;
                        v2ListBots.Add(SanitizeBotListItem(item));
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
                    foreach (var item in pageRes.Data.Items)
                    {
                        if (string.IsNullOrWhiteSpace(item.BotId) || !seenSchedIds.Add(item.BotId))
                            continue;
                        v2ListScheduledBots.Add(SanitizeScheduledListItem(item));
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
            _logger.LogWarning(ex, "Meeting BaaS metadata fetch for Groq failed; continuing with transcript only");
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
        You are an expert meeting analyst and task extraction assistant.

        You may receive optional Meeting BaaS JSON metadata (platform, timing, participant names from the provider, bot status). Treat it as supporting context only.

        You will receive a raw meeting transcript. Your job is to:
        1. Summarize the discussion
        2. Extract key points
        3. Identify clear action items with owners and due dates

        Return ONLY a valid JSON object with EXACTLY these fields:
        {
          "summary": "A concise 2-4 sentence executive summary of what was discussed and decided.",
          "keyPoints": ["Point 1", "Point 2"],
          "actionItems": [
            {
              "owner": "Person's name or null if unclear",
              "task": "Clear, actionable task description",
              "dueDate": "YYYY-MM-DD or null if no date mentioned"
            }
          ]
        }

        STRICT RULES:
        - Do NOT include any text outside the JSON
        - Do NOT add extra fields
        - summary must be factual and based primarily on the transcript; use metadata only when it does not contradict the transcript
        - keyPoints must include decisions, important discussions, or announcements

        ACTION ITEM RULES:
        - Include ONLY explicitly stated or strongly implied tasks
        - Each task must be clear and executable
        - owner: use the person's name if mentioned; otherwise null
        - dueDate: if explicitly mentioned convert to YYYY-MM-DD; if NOT mentioned use the meeting date shown below
        - If NO action items exist return empty array []

        NORMALIZATION:
        - Clean filler words; resolve pronouns when possible; merge duplicate tasks; concise professional language.
        - No markdown, no comments, no trailing commas in JSON.

        """ + "MEETING_DATE_FOR_DEFAULT_DUE_DATES (YYYY-MM-DD): " + meetingDate;

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
        {
            if (DateOnly.TryParse(fallbackYmd, out var d))
                return new DateTimeOffset(d.Year, d.Month, d.Day, 0, 0, 0, TimeSpan.Zero);
            return null;
        }

        if (DateOnly.TryParse(due.Trim(), out var parsed))
            return new DateTimeOffset(parsed.Year, parsed.Month, parsed.Day, 0, 0, 0, TimeSpan.Zero);
        return null;
    }

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true
    };

}
