using System.Text.Json.Serialization;

namespace IntelliMeet.Backend.Application.Integration;

public sealed class ListRawCalendarsRequest
{
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
}

public sealed class RawCalendarListItemData
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("is_primary")]
    public bool IsPrimary { get; set; }
}
