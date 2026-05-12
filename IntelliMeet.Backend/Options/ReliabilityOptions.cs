namespace IntelliMeet.Backend.Options;

/// <summary>
/// In-memory reliability controls for webhook/polling/analyzer behavior.
/// </summary>
public sealed class ReliabilityOptions
{
    public const string SectionName = "Reliability";

    public int WebhookDeduplicationWindowSeconds { get; set; } = 900;

    public int PollingWebhookGraceSeconds { get; set; } = 20;

    public int TranscriptResolveMaxAttempts { get; set; } = 4;

    public int TranscriptResolveInitialDelayMs { get; set; } = 1500;

    public double TranscriptResolveBackoffFactor { get; set; } = 2.0;
}
