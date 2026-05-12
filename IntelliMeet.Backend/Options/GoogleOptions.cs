namespace IntelliMeet.Backend.Options;

public sealed class GoogleOptions
{
    public const string SectionName = "Google";

    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string RedirectUri { get; set; } = string.Empty;
    public string Scopes { get; set; } =
        "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email openid";

    /// <summary>Where API callback redirects the browser after successful server OAuth.</summary>
    public string SpaPostConnectUrl { get; set; } = "http://localhost:5173/calendar";
}
