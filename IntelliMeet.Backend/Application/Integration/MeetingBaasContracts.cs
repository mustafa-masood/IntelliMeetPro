using System.Text.Json;
using System.Text.Json.Serialization;

namespace IntelliMeet.Backend.Application.Integration;

public sealed record MeetingBaasResult<T>(
    bool Success,
    T? Data,
    int? StatusCode,
    string? ErrorMessage,
    string? RawBody);

public sealed class MbEnvelope<T>
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public T? Data { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("error")]
    public string? Error { get; set; }
}

public sealed class CreateBotRequest
{
    [JsonPropertyName("meeting_url")]
    public string MeetingUrl { get; set; } = string.Empty;

    [JsonPropertyName("bot_name")]
    public string BotName { get; set; } = string.Empty;

    [JsonPropertyName("recording_mode")]
    public string? RecordingMode { get; set; }

    [JsonPropertyName("transcription_enabled")]
    public bool? TranscriptionEnabled { get; set; }

    [JsonPropertyName("transcription_config")]
    public JsonElement? TranscriptionConfig { get; set; }

    [JsonPropertyName("extra")]
    public JsonElement? Extra { get; set; }
}

public sealed class ScheduledBotRequest
{
    [JsonPropertyName("meeting_url")]
    public string MeetingUrl { get; set; } = string.Empty;

    [JsonPropertyName("bot_name")]
    public string BotName { get; set; } = string.Empty;

    [JsonPropertyName("recording_mode")]
    public string? RecordingMode { get; set; }

    [JsonPropertyName("join_at")]
    public string JoinAt { get; set; } = string.Empty;
}

public sealed class CreateBotResponseData
{
    [JsonPropertyName("bot_id")]
    public string? BotId { get; set; }
}

public sealed class BotDetailsData
{
    [JsonPropertyName("bot_id")]
    public string? BotId { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("meeting_url")]
    public string? MeetingUrl { get; set; }

    [JsonPropertyName("video")]
    public string? Video { get; set; }

    [JsonPropertyName("audio")]
    public string? Audio { get; set; }

    [JsonPropertyName("transcription")]
    public string? Transcription { get; set; }

    [JsonPropertyName("diarization")]
    public string? Diarization { get; set; }

    [JsonPropertyName("duration_seconds")]
    public double? DurationSeconds { get; set; }

    [JsonPropertyName("created_at")]
    public string? CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public string? UpdatedAt { get; set; }
}

public sealed class BotStatusData
{
    [JsonPropertyName("bot_id")]
    public string? BotId { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("transcription_status")]
    public string? TranscriptionStatus { get; set; }

    [JsonPropertyName("updated_at")]
    public string? UpdatedAt { get; set; }
}

public sealed class MessageData
{
    [JsonPropertyName("message")]
    public string? Message { get; set; }
}

public sealed class DeleteBotDataResponse
{
    [JsonPropertyName("bot_id")]
    public string? BotId { get; set; }

    [JsonPropertyName("deleted")]
    public bool Deleted { get; set; }
}

public sealed class CreateCalendarRequest
{
    /// <summary>v2 uses <c>calendar_platform</c>: <c>google</c> or <c>microsoft</c> (not v1's <c>platform</c>: <c>Google</c>).</summary>
    [JsonPropertyName("calendar_platform")]
    public string CalendarPlatform { get; set; } = "google";

    [JsonPropertyName("oauth_client_id")]
    public string OAuthClientId { get; set; } = string.Empty;

    [JsonPropertyName("oauth_client_secret")]
    public string OAuthClientSecret { get; set; } = string.Empty;

    [JsonPropertyName("oauth_refresh_token")]
    public string OAuthRefreshToken { get; set; } = string.Empty;

    [JsonPropertyName("oauth_tenant_id")]
    public string? OAuthTenantId { get; set; }

    [JsonPropertyName("raw_calendar_id")]
    public string RawCalendarId { get; set; } = string.Empty;
}

public sealed class CalendarCreatedData
{
    [JsonPropertyName("calendar_id")]
    public string? CalendarId { get; set; }

    /// <summary>Some API responses use <c>uuid</c> as the calendar identifier.</summary>
    [JsonPropertyName("uuid")]
    public string? Uuid { get; set; }
}

public sealed class CalendarListItemData
{
    [JsonPropertyName("calendar_id")]
    public string? CalendarId { get; set; }

    [JsonPropertyName("raw_calendar_id")]
    public string? RawCalendarId { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }
}

public sealed class CalendarDetailData
{
    [JsonPropertyName("calendar_id")]
    public string? CalendarId { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }
}

public sealed class CalendarEventsPageData
{
    [JsonPropertyName("events")]
    public IReadOnlyList<CalendarEventApiData>? Events { get; set; }
}

public sealed class CalendarEventApiData
{
    [JsonPropertyName("event_id")]
    public string? EventId { get; set; }

    [JsonPropertyName("series_id")]
    public string? SeriesId { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    /// <summary>v2 list-events uses <c>start_time</c> / <c>end_time</c> (ISO 8601).</summary>
    [JsonPropertyName("start_time")]
    public string? StartTime { get; set; }

    [JsonPropertyName("end_time")]
    public string? EndTime { get; set; }

    [JsonPropertyName("start")]
    public string? Start { get; set; }

    [JsonPropertyName("end")]
    public string? End { get; set; }

    [JsonPropertyName("meeting_url")]
    public string? MeetingUrl { get; set; }

    [JsonPropertyName("meeting_platform")]
    public string? MeetingPlatform { get; set; }

    [JsonPropertyName("is_recurring")]
    public bool? IsRecurring { get; set; }

    [JsonPropertyName("is_cancelled")]
    public bool? IsCancelled { get; set; }

    /// <summary>v2 uses <c>confirmed</c>, <c>cancelled</c>, <c>tentative</c>.</summary>
    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("bot_scheduled")]
    public bool? BotScheduled { get; set; }
}

public sealed class ScheduleCalendarBotRequest
{
    [JsonPropertyName("event_id")]
    public string? EventId { get; set; }

    [JsonPropertyName("series_id")]
    public string? SeriesId { get; set; }

    [JsonPropertyName("all_occurrences")]
    public bool? AllOccurrences { get; set; }

    [JsonPropertyName("bot_name")]
    public string BotName { get; set; } = string.Empty;

    [JsonPropertyName("recording_mode")]
    public string? RecordingMode { get; set; }
}

public sealed class ScheduleCalendarBotData
{
    [JsonPropertyName("bot_id")]
    public string? BotId { get; set; }
}
