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

    /// <summary>Google account email for the selected raw calendar; used to adopt an existing Meeting BaaS connection when list responses omit <c>raw_calendar_id</c>.</summary>
    public string? AccountEmail { get; set; }
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

/// <summary>Meeting BaaS calendar link persisted on the user row.</summary>
public sealed class CalendarMbaasStatusDto
{
    public bool IsConnected { get; init; }
    public string? Provider { get; init; }
    public string? CalendarId { get; init; }
    public Guid? LocalConnectionId { get; init; }
}

/// <summary>Calendar page + Google direct-connect status.</summary>
public sealed class CalendarPageStatusDto
{
    public bool IsConnected { get; init; }
    public DateTimeOffset? LastSyncAtUtc { get; init; }
    public int MeetingCount { get; init; }
}

/// <summary>Meetings materialized from Google Calendar sync (IntelliMeet DB).</summary>
public sealed class CalendarSyncedMeetingDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public DateTimeOffset? StartUtc { get; init; }
    public DateTimeOffset? EndUtc { get; init; }
    public string? MeetingUrl { get; init; }
    public bool IsCancelledFromCalendar { get; init; }
    public DateTimeOffset? BotScheduledAtUtc { get; init; }
    public string? CalendarBotExternalId { get; init; }
    public string? GoogleCalendarEventId { get; init; }
    public string? HtmlLink { get; init; }
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

    /// <summary>When null or whitespace, <c>MeetingBaas:DefaultBotName</c> is used.</summary>
    public string? BotName { get; set; }

    public string? RecordingMode { get; set; }
}

public sealed class ScheduleCalendarBotResponseDto
{
    public string ExternalBotId { get; init; } = string.Empty;
    public Guid? MeetingId { get; init; }
}

public sealed class CreateMeetingFromUiRequestDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public DateTimeOffset StartUtc { get; set; }

    [Required]
    public DateTimeOffset EndUtc { get; set; }

    public IReadOnlyList<string> Attendees { get; set; } = Array.Empty<string>();
    public string? Provider { get; set; } = "google";

    /// <summary>Optional workspace team (enterprise). Must belong to the organizer&apos;s workspace.</summary>
    public Guid? TeamId { get; set; }
}

public sealed class CreateMeetingFromUiResponseDto
{
    public Guid MeetingId { get; init; }
    public Guid? CalendarEventId { get; init; }
    public string? GoogleCalendarEventId { get; init; }
    public string MeetingUrl { get; init; } = string.Empty;
    public bool BotScheduled { get; init; }
    public bool BotAlreadyScheduled { get; init; }
}

public sealed class CalendarMeetingListItemDto
{
    public Guid MeetingId { get; init; }
    public string Title { get; init; } = string.Empty;
    public DateTimeOffset? StartUtc { get; init; }
    public DateTimeOffset? EndUtc { get; init; }
    public string? MeetingUrl { get; init; }
    public bool BotScheduled { get; init; }
    public DateTimeOffset? BotScheduledAtUtc { get; init; }
    public string? CalendarEventLink { get; init; }
    public bool TranscriptReady { get; init; }
    public bool IsPast { get; init; }
}
