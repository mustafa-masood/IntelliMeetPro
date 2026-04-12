namespace IntelliMeet.Backend.Options;

public sealed class GoogleOAuthOptions
{
    public const string SectionName = "GoogleOAuth";

    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;

    /// <summary>Must match an authorized redirect URI in Google Cloud (e.g. http://localhost:5173/oauth/google/callback).</summary>
    public string RedirectUri { get; set; } = "http://localhost:5173/oauth/google/callback";
}
