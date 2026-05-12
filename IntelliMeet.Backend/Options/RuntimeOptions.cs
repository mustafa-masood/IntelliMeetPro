namespace IntelliMeet.Backend.Options;

/// <summary>
/// Runtime toggles used for local/dev hardening while repositories are in-memory.
/// </summary>
public sealed class RuntimeOptions
{
    public const string SectionName = "Runtime";

    /// <summary>
    /// Seeds deterministic demo data when repositories are empty.
    /// </summary>
    public bool SeedDemoData { get; set; } = true;
}
