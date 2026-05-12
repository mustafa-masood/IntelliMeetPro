namespace IntelliMeet.Backend.Application.Abstractions;

/// <summary>
/// In-memory coordination for webhook/polling overlap until persistent infra is introduced.
/// </summary>
public interface IMeetingFlowCoordinationStore
{
    bool TryBeginWebhookEvent(string dedupeKey, DateTimeOffset nowUtc, TimeSpan window);

    void MarkWebhookTouch(Guid meetingId, DateTimeOffset nowUtc);

    bool HasRecentWebhookTouch(Guid meetingId, DateTimeOffset nowUtc, TimeSpan graceWindow);
}
