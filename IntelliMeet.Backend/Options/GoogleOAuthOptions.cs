namespace IntelliMeet.Backend.Options;

public sealed class GoogleOAuthOptions
{
    public const string SectionName = "GoogleOAuth";

    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;

    /// <summary>Must match an authorized redirect URI in Google Cloud (e.g. http://localhost:5173/oauth/google/callback).</summary>
    public string RedirectUri { get; set; } = "http://localhost:5173/oauth/google/callback";

    /// <summary>Space-separated scopes for direct calendar connect (server-side OAuth).</summary>
    public string Scopes { get; set; } = "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email openid";

    /// <summary>Frontend path after successful server OAuth (e.g. /calendar).</summary>
    public string SpaPostConnectPath { get; set; } = "/calendar";
}
