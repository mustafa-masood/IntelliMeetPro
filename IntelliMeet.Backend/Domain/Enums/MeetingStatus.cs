namespace IntelliMeet.Backend.Domain.Enums;

/// <summary>High-level meeting lifecycle in our domain (not 1:1 with Meeting BaaS bot status).</summary>
public enum MeetingStatus
{
    Scheduled = 0,
    Live = 1,
    Processing = 2,
    Completed = 3,
    Failed = 4,
    Cancelled = 5
}
