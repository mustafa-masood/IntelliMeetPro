using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Domain.Entities;

public sealed class Meeting
{
    public Guid Id { get; set; }
    public Guid? OrganizerUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Platform { get; set; }
    public string MeetingUrl { get; set; } = string.Empty;
    public DateTimeOffset? StartUtc { get; set; }
    public DateTimeOffset? EndUtc { get; set; }
    public IReadOnlyList<string> Participants { get; set; } = Array.Empty<string>();
    public MeetingStatus Status { get; set; }
    public Guid? CalendarEventId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
