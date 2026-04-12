namespace IntelliMeet.Backend.Domain.Entities;

public sealed class CalendarEvent
{
    public Guid Id { get; set; }
    public Guid CalendarConnectionId { get; set; }
    public string ExternalEventId { get; set; } = string.Empty;
    public string? SeriesId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset StartUtc { get; set; }
    public DateTimeOffset EndUtc { get; set; }
    public string? MeetingUrl { get; set; }
    public bool IsRecurring { get; set; }
    public bool IsCancelled { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    /// <summary>Linked internal meeting when a bot was scheduled for this event.</summary>
    public Guid? LinkedMeetingId { get; set; }
}
