namespace IntelliMeet.Backend.Application.Abstractions;

/// <summary>Pulls Meeting BaaS bot status/details and applies artifacts; optionally triggers transcript analysis.</summary>
public interface IMeetingBaasStateSynchronizer
{
    Task SyncMeetingAsync(Guid meetingId, string source, CancellationToken ct);
}
