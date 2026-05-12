namespace IntelliMeet.Backend.Options;

public sealed class AsanaOptions
{
    public const string SectionName = "Asana";

    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    /// <summary>Default: https://app.asana.com/-/oauth_authorize</summary>
    public string AuthUrl { get; set; } = "https://app.asana.com/-/oauth_authorize";
    /// <summary>Default: https://app.asana.com/-/oauth_token</summary>
    public string TokenUrl { get; set; } = "https://app.asana.com/-/oauth_token";
    public string RedirectUri { get; set; } = string.Empty;
    /// <summary>
    /// Space-separated granular scopes (must match developer console). Leave empty to omit <c>scope</c> from the authorize URL —
    /// Asana then uses the app&apos;s registered permissions (e.g. Full permissions). See OAuth docs.
    /// </summary>
    public string Scopes { get; set; } = "";

    public string ApiBaseUrl { get; set; } = "https://app.asana.com/api/1.0/";
}
