namespace IntelliMeet.Backend.Options;

/// <summary>Shared integration behaviour (demo identity, deep links).</summary>
public sealed class IntegrationsOptions
{
    public const string SectionName = "Integrations";

    /// <summary>Fallback user when no header/query is provided (demo seeder id).</summary>
    public string DefaultUserId { get; set; } = "11111111-1111-1111-1111-111111111111";

    /// <summary>Public app base URL for links embedded in third-party task descriptions (optional).</summary>
    public string? MeetingLinkBaseUrl { get; set; }

    /// <summary>Vite dev server URL for post-OAuth redirects (e.g. http://localhost:5173).</summary>
    public string SpaBaseUrl { get; set; } = "http://localhost:5173";
}
