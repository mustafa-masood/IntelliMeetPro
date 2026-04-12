using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface ITranscriptRepository
{
    Transcript? GetByMeetingId(Guid meetingId);
    void Upsert(Transcript transcript);
    IReadOnlyList<TranscriptSegment> GetSegments(Guid transcriptId);
    void ReplaceSegments(Guid transcriptId, IReadOnlyList<TranscriptSegment> segments);
}
