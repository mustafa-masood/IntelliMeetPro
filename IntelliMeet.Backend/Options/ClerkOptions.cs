namespace IntelliMeet.Backend.Options;

public sealed class ClerkOptions
{
    public const string SectionName = "Clerk";

    /// <summary>Clerk Frontend API URL used as JWT issuer, e.g. <c>https://your-instance.clerk.accounts.dev</c></summary>
    public string Authority { get; set; } = string.Empty;

    public string? Audience { get; set; }

    public bool Enabled => !string.IsNullOrWhiteSpace(Authority);
}
