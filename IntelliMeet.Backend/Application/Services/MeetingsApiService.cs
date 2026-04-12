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
    private readonly IMeetingBaasClient _mb;
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
        IMeetingBaasClient mb,
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
        _mb = mb;
        _logger = logger;
    }

    public Task<IReadOnlyList<MeetingListItemDto>> ListAsync(CancellationToken ct)
    {
        var list = _meetings.GetAll().Select(m =>
        {
            var bot = _bots.GetByMeetingId(m.Id).FirstOrDefault();
            return new MeetingListItemDto
            {
                Id = m.Id,
                Title = m.Title,
                MeetingUrl = m.MeetingUrl,
                Status = m.Status,
                StartUtc = m.StartUtc,
                EndUtc = m.EndUtc,
                PrimaryBotStatus = bot?.Status.ToString()
            };
        }).ToList();
        return Task.FromResult<IReadOnlyList<MeetingListItemDto>>(list);
    }

    public async Task<MeetingDetailDto?> GetDetailAsync(Guid id, CancellationToken ct)
    {
        var m = _meetings.GetById(id);
        if (m is null)
            return null;
        await RefreshBotsFromMeetingBaasAsync(m.Id, ct).ConfigureAwait(false);
        var bots = _bots.GetByMeetingId(m.Id).Select(b => new MeetingBotSummaryDto
        {
            Id = b.Id,
            ExternalBotId = b.ExternalBotId,
            Status = b.Status,
            TranscriptionStatus = b.TranscriptionStatus
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
            RecentWebhooks = webhookItems
        };
    }

    private async Task RefreshBotsFromMeetingBaasAsync(Guid meetingId, CancellationToken ct)
    {
        foreach (var bot in _bots.GetByMeetingId(meetingId))
        {
            if (string.IsNullOrWhiteSpace(bot.ExternalBotId))
                continue;
            try
            {
                var st = await _mb.GetBotStatusAsync(bot.ExternalBotId, ct).ConfigureAwait(false);
                if (!st.Success || st.Data is null)
                    continue;
                bot.Status = BotStatusMapper.FromMeetingBaas(st.Data.Status);
                bot.TranscriptionStatus = BotStatusMapper.TranscriptionFromMeetingBaas(st.Data.TranscriptionStatus);
                bot.UpdatedAt = DateTimeOffset.UtcNow;
                _bots.Upsert(bot);
            }
            catch (Exception ex)
            {
                _logger.LogDebug(ex, "Skip bot refresh for {BotId}", bot.ExternalBotId);
            }
        }
    }

    public Task<TranscriptDto?> GetTranscriptAsync(Guid id, CancellationToken ct)
    {
        if (_meetings.GetById(id) is null)
            return Task.FromResult<TranscriptDto?>(null);
        var t = _transcripts.GetByMeetingId(id);
        if (t is null)
            return Task.FromResult<TranscriptDto?>(new TranscriptDto
            {
                MeetingId = id,
                Status = TranscriptStatus.None,
                Segments = Array.Empty<TranscriptSegmentDto>()
            });
        var segments = _transcripts.GetSegments(t.Id).Select(s => new TranscriptSegmentDto
        {
            Speaker = s.Speaker,
            StartSeconds = s.StartSeconds,
            EndSeconds = s.EndSeconds,
            Text = s.Text
        }).ToList();
        return Task.FromResult<TranscriptDto?>(new TranscriptDto
        {
            MeetingId = id,
            Status = t.Status,
            RawText = t.RawText,
            ExternalTranscriptionUrl = t.ExternalTranscriptionUrl,
            Segments = segments
        });
    }

    public Task<MeetingSummaryDto?> GetSummaryAsync(Guid id, CancellationToken ct)
    {
        if (_meetings.GetById(id) is null)
            return Task.FromResult<MeetingSummaryDto?>(null);
        var s = _summaries.GetByMeetingId(id);
        var kp = _keyPoints.GetByMeetingId(id).OrderBy(k => k.Order).Select(k => k.Text).ToList();
        if (s is null && kp.Count == 0)
            return Task.FromResult<MeetingSummaryDto?>(new MeetingSummaryDto { MeetingId = id, KeyPoints = kp });
        return Task.FromResult<MeetingSummaryDto?>(new MeetingSummaryDto
        {
            MeetingId = id,
            ShortSummary = s?.ShortSummary ?? string.Empty,
            StructuredSections = s?.StructuredSections ?? Array.Empty<string>(),
            KeyPoints = kp
        });
    }

    public Task<IReadOnlyList<ActionItemDto>> GetActionItemsAsync(Guid id, CancellationToken ct)
    {
        if (_meetings.GetById(id) is null)
            return Task.FromResult<IReadOnlyList<ActionItemDto>>(Array.Empty<ActionItemDto>());
        var list = _actionItems.GetByMeetingId(id).Select(MapActionItem).ToList();
        return Task.FromResult<IReadOnlyList<ActionItemDto>>(list);
    }

    public Task<TodoItemDto> ConvertActionItemToTodoAsync(Guid meetingId, Guid actionItemId, Guid? userId, string? type, CancellationToken ct)
    {
        var meeting = _meetings.GetById(meetingId) ?? throw new KeyNotFoundException("Meeting not found.");
        var item = _actionItems.GetById(actionItemId) ?? throw new KeyNotFoundException("Action item not found.");
        if (item.MeetingId != meetingId)
            throw new InvalidOperationException("Action item does not belong to this meeting.");
        var now = DateTimeOffset.UtcNow;
        var todo = new TodoItem
        {
            Id = Guid.NewGuid(),
            UserId = userId,
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
        if (_meetings.GetById(meetingId) is null)
            throw new KeyNotFoundException("Meeting not found.");
        var now = DateTimeOffset.UtcNow;
        var item = new ActionItem
        {
            Id = Guid.NewGuid(),
            MeetingId = meetingId,
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
        LinkedTodoItemId = a.LinkedTodoItemId
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
