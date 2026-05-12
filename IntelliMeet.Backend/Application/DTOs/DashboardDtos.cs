using System.ComponentModel.DataAnnotations;

namespace IntelliMeet.Backend.Application.DTOs;

public sealed class UpcomingMeetingCardDto
{
    public Guid MeetingId { get; init; }
    public string Title { get; init; } = string.Empty;
    public DateTimeOffset? StartUtc { get; init; }
    public DateTimeOffset? EndUtc { get; init; }
    public string MeetingUrl { get; init; } = string.Empty;
    public string BotStatus { get; init; } = string.Empty;
    public string? ExternalBotId { get; init; }
    public string? CalendarEventTitle { get; init; }
    public Guid? CalendarEventId { get; init; }
}

public sealed class DashboardCalendarEntryDto
{
    public Guid? CalendarEventId { get; init; }
    public Guid? CalendarConnectionId { get; init; }
    public string Title { get; init; } = string.Empty;
    public DateTimeOffset StartUtc { get; init; }
    public DateTimeOffset EndUtc { get; init; }
    public string? MeetingUrl { get; init; }
    public bool HasScheduledBot { get; init; }
}

public sealed class BotJoinRequestDto
{
    [Required]
    [Url]
    public string MeetingUrl { get; set; } = string.Empty;

    /// <summary>When null or whitespace, the API uses <c>MeetingBaas:DefaultBotName</c>.</summary>
    public string? BotName { get; set; }

    public Guid? UserId { get; set; }
    public string? RecordingMode { get; set; }
    public bool TranscriptionEnabled { get; set; } = true;
}

public sealed class BotJoinResponseDto
{
    public Guid MeetingId { get; init; }
    public Guid MeetingBotId { get; init; }
    public string ExternalBotId { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
}
