namespace IntelliMeet.Backend.Options;

public sealed class MeetingBaasPollingOptions
{
    public const string SectionName = "MeetingBaasPolling";

    public bool Enabled { get; set; } = true;

    public int IntervalSeconds { get; set; } = 20;
}
