using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Domain.Entities;

public sealed class CalendarConnection
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public CalendarProvider Provider { get; set; }
    /// <summary>Meeting BaaS calendar id returned from <c>POST /v2/calendars</c>.</summary>
    public string ExternalCalendarId { get; set; } = string.Empty;
    public string RawCalendarId { get; set; } = string.Empty;
    public string OAuthRefreshToken { get; set; } = string.Empty;
    public Guid IntegrationCredentialsId { get; set; }
    public string? AccountEmail { get; set; }
    public string Status { get; set; } = "connected";
    public DateTimeOffset? LastSyncedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
