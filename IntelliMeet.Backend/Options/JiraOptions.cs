namespace IntelliMeet.Backend.Options;

public sealed class JiraOptions
{
    public const string SectionName = "Jira";

    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    /// <summary>Default Atlassian authorize endpoint.</summary>
    public string AuthUrl { get; set; } = "https://auth.atlassian.com/authorize";
    public string TokenUrl { get; set; } = "https://auth.atlassian.com/oauth/token";
    /// <summary>Must match the callback URL registered for the OAuth app (e.g. http://localhost:5172/api/integrations/jira/callback).</summary>
    public string RedirectUri { get; set; } = string.Empty;
    /// <summary>Space-separated; include offline_access for refresh tokens.</summary>
    public string Scopes { get; set; } = "offline_access read:jira-work write:jira-work";

    public string AccessibleResourcesUrl { get; set; } = "https://api.atlassian.com/oauth/token/accessible-resources";
}
