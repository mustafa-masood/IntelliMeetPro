namespace IntelliMeet.Backend.Application.Services;

public interface IMeetingRagIndexerService
{
    /// <param name="forceReindex">When false, skips work if the meeting already has <c>RagIndexedAtUtc</c> set.</param>
    Task IndexMeetingTranscriptAsync(Guid meetingId, string transcriptText, bool forceReindex, CancellationToken ct);
}
