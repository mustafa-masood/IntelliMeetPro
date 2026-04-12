using System.ComponentModel.DataAnnotations;
using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.DTOs;

public sealed class ConnectCalendarRequestDto
{
    public Guid UserId { get; set; }
    public CalendarProvider Provider { get; set; } = CalendarProvider.Google;

    /// <summary>Optional when server has GoogleOAuth ClientId/Secret configured.</summary>
    public string? OAuthClientId { get; set; }

    public string? OAuthClientSecret { get; set; }

    [Required]
    public string OAuthRefreshToken { get; set; } = string.Empty;

    public string? OAuthTenantId { get; set; }

    [Required]
    public string RawCalendarId { get; set; } = string.Empty;
}

public sealed class CalendarConnectionDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public CalendarProvider Provider { get; init; }
    public string ExternalCalendarId { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTimeOffset? LastSyncedAt { get; init; }
    public string? AccountEmail { get; init; }
}

public sealed class CalendarEventDto
{
    public Guid Id { get; init; }
    public string ExternalEventId { get; init; } = string.Empty;
    public string? SeriesId { get; init; }
    public string Title { get; init; } = string.Empty;
    public DateTimeOffset StartUtc { get; init; }
    public DateTimeOffset EndUtc { get; init; }
    public string? MeetingUrl { get; init; }
    public bool IsRecurring { get; init; }
    public bool IsCancelled { get; init; }
    public Guid? LinkedMeetingId { get; init; }
}

public sealed class ScheduleCalendarBotRequestDto
{
    [Required]
    public string EventId { get; set; } = string.Empty;

    public string? SeriesId { get; set; }
    public bool AllOccurrences { get; set; }

    [Required]
    public string BotName { get; set; } = string.Empty;

    public string? RecordingMode { get; set; }
}

public sealed class ScheduleCalendarBotResponseDto
{
    public string ExternalBotId { get; init; } = string.Empty;
    public Guid? MeetingId { get; init; }
}
