using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.Services;

public sealed class MeetingsApiService : IMeetingsApiService
{
    private readonly IMeetingRepository _meetings;
    private readonly IMeetingBotRepository _bots;
    private readonly ITranscriptRepository _transcripts;
    private readonly IMeetingSummaryRepository _summaries;
    private readonly IKeyPointRepository _keyPoints;
    private readonly IActionItemRepository _actionItems;
    private readonly ITodoRepository _todos;
    private readonly IRecordingAssetRepository _recordings;
    private readonly IWebhookEventRepository _webhooks;
    private readonly IMeetingBaasStateSynchronizer _mbSync;
    private readonly ITranscriptTextResolver _transcriptText;
    private readonly ICurrentUserContext _currentUser;
    private readonly ILogger<MeetingsApiService> _logger;

    public MeetingsApiService(
        IMeetingRepository meetings,
        IMeetingBotRepository bots,
        ITranscriptRepository transcripts,
        IMeetingSummaryRepository summaries,
        IKeyPointRepository keyPoints,
        IActionItemRepository actionItems,
        ITodoRepository todos,
        IRecordingAssetRepository recordings,
        IWebhookEventRepository webhooks,
        IMeetingBaasStateSynchronizer mbSync,
        ITranscriptTextResolver transcriptText,
        ICurrentUserContext currentUser,
        ILogger<MeetingsApiService> logger)
    {
        _meetings = meetings;
        _bots = bots;
        _transcripts = transcripts;
        _summaries = summaries;
        _keyPoints = keyPoints;
        _actionItems = actionItems;
        _todos = todos;
        _recordings = recordings;
        _webhooks = webhooks;
        _mbSync = mbSync;
        _transcriptText = transcriptText;
        _currentUser = currentUser;
        _logger = logger;
    }

    public Task<IReadOnlyList<MeetingListItemDto>> ListAsync(CancellationToken ct)
    {
        var meetings = (_currentUser.IsResolved && _currentUser.WorkspaceId != Guid.Empty
                ? _meetings.ListForWorkspace(_currentUser.WorkspaceId)
                : _meetings.GetAll())
            .ToList();

        // Enterprise members are scoped to their team; admins see all teams in the workspace.
        if (_currentUser.IsResolved &&
            _currentUser.WorkspaceId != Guid.Empty &&
            _currentUser.Role == WorkspaceMemberRole.Member &&
            _currentUser.TeamId.HasValue)
        {
            meetings = meetings.Where(m => m.TeamId.HasValue && m.TeamId.Value == _currentUser.TeamId.Value).ToList();
        }
        var botsForMeetings = _bots.GetBotsForMeetingIds(meetings.Select(x => x.Id).ToList());
        var firstBotByMeeting = botsForMeetings
            .GroupBy(b => b.MeetingId)
            .ToDictionary(g => g.Key, g => g.OrderBy(b => b.Id).First());

        var list = meetings.Select(m =>
        {
            firstBotByMeeting.TryGetValue(m.Id, out var bot);
            return new MeetingListItemDto
            {
                Id = m.Id,
                Title = m.Title,
                MeetingUrl = m.MeetingUrl,
                Status = m.Status,
                StartUtc = m.StartUtc,
                EndUtc = m.EndUtc,
                PrimaryBotStatus = bot?.Status.ToString(),
                PrimaryBotStatusLabel = bot is null ? "Bot not started" : MeetingStatusTextMapper.BotStatus(bot.Status),
                ProcessingStatusLabel = MeetingStatusTextMapper.ProcessingStatus(m.ProcessingStatus)
            };
        }).ToList();
        return Task.FromResult<IReadOnlyList<MeetingListItemDto>>(list);
    }

    public async Task<MeetingDetailDto?> GetDetailAsync(Guid id, CancellationToken ct)
    {
        var m = _meetings.GetById(id);
        if (m is null)
            return null;
        if (!CanAccessMeeting(m))
            return null;
        await _mbSync.SyncMeetingAsync(m.Id, "api-read", ct).ConfigureAwait(false);
        m = _meetings.GetById(id) ?? m;
        var bots = _bots.GetByMeetingId(m.Id).Select(b => new MeetingBotSummaryDto
        {
            Id = b.Id,
            ExternalBotId = b.ExternalBotId,
            Status = b.Status,
            TranscriptionStatus = b.TranscriptionStatus,
            StatusLabel = MeetingStatusTextMapper.BotStatus(b.Status),
            TranscriptionStatusLabel = MeetingStatusTextMapper.TranscriptStatus(b.TranscriptionStatus)
        }).ToList();
        var audio = _recordings.GetByMeetingId(m.Id).FirstOrDefault(r => r.Kind.Equals("audio", StringComparison.OrdinalIgnoreCase))?.Url;
        var botIds = _bots.GetByMeetingId(m.Id).Select(b => b.ExternalBotId).Where(s => !string.IsNullOrEmpty(s));
        var webhookItems = new List<WebhookHistoryItemDto>();
        foreach (var bid in botIds)
        {
            foreach (var w in _webhooks.GetRecentContaining(bid!, 5))
            {
                webhookItems.Add(new WebhookHistoryItemDto
                {
                    Id = w.Id,
                    EventType = w.EventType,
                    ReceivedAt = w.ReceivedAt,
                    Processed = w.Processed
                });
            }
        }

        webhookItems = webhookItems.OrderByDescending(w => w.ReceivedAt).DistinctBy(w => w.Id).Take(10).ToList();

        var transcript = await BuildTranscriptDtoAsync(m.Id, skipSync: true, ct).ConfigureAwait(false);
        var summary = BuildSummaryDto(m.Id);
        var actions = _actionItems.GetByMeetingId(m.Id).Select(MapActionItem).ToList();

        return new MeetingDetailDto
        {
            Id = m.Id,
            Title = m.Title,
            Platform = m.Platform,
            MeetingUrl = m.MeetingUrl,
            Status = m.Status,
            StartUtc = m.StartUtc,
            EndUtc = m.EndUtc,
            Participants = m.Participants,
            CalendarEventId = m.CalendarEventId,
            Bots = bots,
            AudioPlaybackUrl = audio,
            RecentWebhooks = webhookItems,
            ProcessingStatus = m.ProcessingStatus,
            LifecycleStatusLabel = MeetingStatusTextMapper.LifecycleStatus(m.Status),
            ProcessingStatusLabel = MeetingStatusTextMapper.ProcessingStatus(m.ProcessingStatus),
            TranscriptAnalysisCompleted = m.TranscriptAnalysisCompleted,
            AnalysisError = m.AnalysisError,
            RagIndexedAtUtc = m.RagIndexedAtUtc,
            Transcript = transcript,
            Summary = summary,
            ActionItems = actions
        };
    }

    public async Task<TranscriptDto?> GetTranscriptAsync(Guid id, CancellationToken ct)
    {
        var m = _meetings.GetById(id);
        if (!CanAccessMeeting(m))
            return null;
        await _mbSync.SyncMeetingAsync(id, "api-read", ct).ConfigureAwait(false);
        return await BuildTranscriptDtoAsync(id, skipSync: true, ct).ConfigureAwait(false);
    }

    private async Task<TranscriptDto> BuildTranscriptDtoAsync(Guid id, bool skipSync, CancellationToken ct)
    {
        if (!skipSync)
            await _mbSync.SyncMeetingAsync(id, "api-read", ct).ConfigureAwait(false);

        var t = _transcripts.GetByMeetingId(id);
        if (t is null)
            return new TranscriptDto
            {
                MeetingId = id,
                Status = TranscriptStatus.None,
                Segments = Array.Empty<TranscriptSegmentDto>()
            };

        var rawForDto = t.RawText;
        if (ShouldHydrateTranscriptText(rawForDto))
        {
            try
            {
                var resolved = await _transcriptText.ResolvePlainTextAsync(id, ct).ConfigureAwait(false);
                if (!string.IsNullOrWhiteSpace(resolved))
                {
                    rawForDto = resolved;
                    t.RawText = resolved;
                    t.UpdatedAt = DateTimeOffset.UtcNow;
                    _transcripts.Upsert(t);
                }
            }
            catch (Exception ex)
            {
                _logger.LogDebug(ex, "Transcript hydrate skipped for meeting {MeetingId}", id);
            }
        }

        var segments = _transcripts.GetSegments(t.Id).Select(s => new TranscriptSegmentDto
        {
            Speaker = s.Speaker,
            StartSeconds = s.StartSeconds,
            EndSeconds = s.EndSeconds,
            Text = s.Text
        }).ToList();
        return new TranscriptDto
        {
            MeetingId = id,
            Status = t.Status,
            RawText = rawForDto,
            ExternalTranscriptionUrl = t.ExternalTranscriptionUrl,
            ExternalRawTranscriptionUrl = t.ExternalRawTranscriptionUrl,
            Segments = segments
        };
    }

    private static bool ShouldHydrateTranscriptText(string? rawText)
    {
        if (string.IsNullOrWhiteSpace(rawText))
            return true;
        var t = rawText.TrimStart();
        // Diyarization JSONL (speaker/start/end only) is not useful transcript text.
        return t.StartsWith("{\"speaker\"", StringComparison.OrdinalIgnoreCase) && !t.Contains("\"text\"", StringComparison.OrdinalIgnoreCase);
    }

    public async Task<MeetingSummaryDto?> GetSummaryAsync(Guid id, CancellationToken ct)
    {
        var m = _meetings.GetById(id);
        if (!CanAccessMeeting(m))
            return null;
        await _mbSync.SyncMeetingAsync(id, "api-read", ct).ConfigureAwait(false);
        return BuildSummaryDto(id);
    }

    private MeetingSummaryDto BuildSummaryDto(Guid id)
    {
        var s = _summaries.GetByMeetingId(id);
        var kp = _keyPoints.GetByMeetingId(id).OrderBy(k => k.Order).Select(k => k.Text).ToList();
        if (s is null && kp.Count == 0)
            return new MeetingSummaryDto { MeetingId = id, KeyPoints = kp };
        return new MeetingSummaryDto
        {
            MeetingId = id,
            ShortSummary = s?.ShortSummary ?? string.Empty,
            StructuredSections = s?.StructuredSections ?? Array.Empty<string>(),
            KeyPoints = kp,
            Decisions = s?.Decisions ?? Array.Empty<string>(),
            Risks = s?.Risks ?? Array.Empty<string>()
        };
    }

    public async Task<IReadOnlyList<ActionItemDto>> GetActionItemsAsync(Guid id, CancellationToken ct)
    {
        if (!CanAccessMeeting(_meetings.GetById(id)))
            return Array.Empty<ActionItemDto>();
        await _mbSync.SyncMeetingAsync(id, "api-read", ct).ConfigureAwait(false);
        var list = _actionItems.GetByMeetingId(id).Select(MapActionItem).ToList();
        return list;
    }

    public Task<TodoItemDto> ConvertActionItemToTodoAsync(Guid meetingId, Guid actionItemId, Guid? userId, string? type, CancellationToken ct)
    {
        var meeting = _meetings.GetById(meetingId) ?? throw new KeyNotFoundException("Meeting not found.");
        if (!CanAccessMeeting(meeting))
            throw new KeyNotFoundException("Meeting not found.");
        var item = _actionItems.GetById(actionItemId) ?? throw new KeyNotFoundException("Action item not found.");
        if (item.MeetingId != meetingId)
            throw new InvalidOperationException("Action item does not belong to this meeting.");
        var now = DateTimeOffset.UtcNow;
        var todoUserId = userId ?? (_currentUser.IsResolved ? _currentUser.UserId : null);
        var todo = new TodoItem
        {
            Id = Guid.NewGuid(),
            UserId = todoUserId,
            Title = item.Title,
            Description = item.Description,
            Type = type ?? "action_item",
            DueDate = item.DueDate,
            Status = TodoStatus.Open,
            SourceMeetingId = meeting.Id,
            SourceActionItemId = item.Id,
            CreatedAt = now,
            UpdatedAt = now
        };
        _todos.Upsert(todo);
        item.AddToTodoChecked = true;
        item.LinkedTodoItemId = todo.Id;
        _actionItems.Upsert(item);
        return Task.FromResult(MapTodo(todo));
    }

    public Task<ActionItemDto> AssignTaskAsync(Guid meetingId, AssignTaskRequestDto body, CancellationToken ct)
    {
        var meeting = _meetings.GetById(meetingId) ?? throw new KeyNotFoundException("Meeting not found.");
        if (!CanAccessMeeting(meeting))
            throw new KeyNotFoundException("Meeting not found.");
        var now = DateTimeOffset.UtcNow;
        var item = new ActionItem
        {
            Id = Guid.NewGuid(),
            MeetingId = meetingId,
            WorkspaceId = meeting.WorkspaceId,
            Title = body.Title,
            Description = body.Description,
            Owner = body.Assignee,
            DueDate = body.DueDate,
            Priority = body.Priority,
            Status = "open",
            AddToTodoChecked = false,
            LinkedTodoItemId = null
        };
        _actionItems.Upsert(item);
        return Task.FromResult(MapActionItem(item));
    }

    public Task<ActionItemDto> AssignActionItemUserAsync(Guid meetingId, Guid actionItemId, AssignActionItemUserRequestDto body, CancellationToken ct)
    {
        if (_currentUser.IsResolved && _currentUser.Role != WorkspaceMemberRole.Admin)
            throw new InvalidOperationException("Only workspace admins can assign action items.");
        var meeting = _meetings.GetById(meetingId) ?? throw new KeyNotFoundException("Meeting not found.");
        if (!CanAccessMeeting(meeting))
            throw new KeyNotFoundException("Meeting not found.");
        var item = _actionItems.GetById(actionItemId) ?? throw new KeyNotFoundException("Action item not found.");
        if (item.MeetingId != meetingId)
            throw new InvalidOperationException("Action item does not belong to this meeting.");
        item.AssignedUserId = body.AssignedUserId;
        _actionItems.Upsert(item);
        return Task.FromResult(MapActionItem(item));
    }

    private bool CanAccessMeeting(Meeting? m)
    {
        if (m is null) return false;
        if (!_currentUser.IsResolved || _currentUser.WorkspaceId == Guid.Empty) return true;
        if (!m.WorkspaceId.HasValue) return true;
        if (m.WorkspaceId.Value != _currentUser.WorkspaceId) return false;

        // Enterprise member must match team; fail closed if meeting has no team.
        if (_currentUser.Role == WorkspaceMemberRole.Member && _currentUser.TeamId.HasValue)
            return m.TeamId.HasValue && m.TeamId.Value == _currentUser.TeamId.Value;

        return true;
    }

    private static ActionItemDto MapActionItem(ActionItem a) => new()
    {
        Id = a.Id,
        Title = a.Title,
        Description = a.Description,
        Owner = a.Owner,
        DueDate = a.DueDate,
        Priority = a.Priority,
        Status = a.Status,
        AddToTodoChecked = a.AddToTodoChecked,
        LinkedTodoItemId = a.LinkedTodoItemId,
        ExternalTaskUrl = a.ExternalTaskUrl,
        SyncedPlatform = a.SyncedPlatform,
        AssignedUserId = a.AssignedUserId,
        SuggestedAssigneeName = a.SuggestedAssigneeName,
        SuggestedAssigneeConfidence = a.SuggestedAssigneeConfidence
    };

    private static TodoItemDto MapTodo(TodoItem t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        Type = t.Type,
        DueDate = t.DueDate,
        Status = t.Status,
        SourceMeetingId = t.SourceMeetingId,
        SourceActionItemId = t.SourceActionItemId
    };
}
