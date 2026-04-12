namespace IntelliMeet.Backend.Domain.Enums;

/// <summary>Known Meeting BaaS webhook <c>type</c> / event names (SVIX payload).</summary>
public enum WebhookEventType
{
    Unknown = 0,
    BotStatusChange = 1,
    BotCompleted = 2,
    BotFailed = 3,
    CalendarConnectionCreated = 4,
    CalendarConnectionUpdated = 5,
    CalendarConnectionDeleted = 6,
    CalendarConnectionError = 7,
    CalendarEventsSynced = 8,
    CalendarEventCreated = 9,
    CalendarEventUpdated = 10,
    CalendarEventCancelled = 11,
    TranscriptionComplete = 12
}
