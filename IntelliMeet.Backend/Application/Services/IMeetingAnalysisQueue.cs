namespace IntelliMeet.Backend.Application.Services;

public interface IMeetingAnalysisQueue
{
    /// <summary>Schedules analysis work; returns when the item is accepted by the channel (not when analysis finishes).</summary>
    ValueTask EnqueueAsync(Guid meetingId, bool force, CancellationToken ct);
}
