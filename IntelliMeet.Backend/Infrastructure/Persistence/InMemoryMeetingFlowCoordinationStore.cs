using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryMeetingFlowCoordinationStore : IMeetingFlowCoordinationStore
{
    private readonly ConcurrentDictionary<string, DateTimeOffset> _webhookDedup = new(StringComparer.Ordinal);
    private readonly ConcurrentDictionary<Guid, DateTimeOffset> _webhookTouchesByMeeting = new();

    public bool TryBeginWebhookEvent(string dedupeKey, DateTimeOffset nowUtc, TimeSpan window)
    {
        if (string.IsNullOrWhiteSpace(dedupeKey))
            return true;

        var seenAt = _webhookDedup.GetOrAdd(dedupeKey, nowUtc);
        if (seenAt != nowUtc && nowUtc - seenAt < window)
            return false;

        _webhookDedup[dedupeKey] = nowUtc;
        return true;
    }

    public void MarkWebhookTouch(Guid meetingId, DateTimeOffset nowUtc) => _webhookTouchesByMeeting[meetingId] = nowUtc;

    public bool HasRecentWebhookTouch(Guid meetingId, DateTimeOffset nowUtc, TimeSpan graceWindow) =>
        _webhookTouchesByMeeting.TryGetValue(meetingId, out var at) && nowUtc - at < graceWindow;
}
