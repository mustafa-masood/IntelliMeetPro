using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryTranscriptRepository : ITranscriptRepository
{
    private readonly ConcurrentDictionary<Guid, Transcript> _byId = new();
    private readonly ConcurrentDictionary<Guid, Guid> _meetingToTranscript = new();
    private readonly ConcurrentDictionary<Guid, List<TranscriptSegment>> _segments = new();

    public Transcript? GetByMeetingId(Guid meetingId)
    {
        if (!_meetingToTranscript.TryGetValue(meetingId, out var tid))
            return null;
        return _byId.GetValueOrDefault(tid);
    }

    public void Upsert(Transcript transcript)
    {
        _byId[transcript.Id] = transcript;
        _meetingToTranscript[transcript.MeetingId] = transcript.Id;
        _segments.GetOrAdd(transcript.Id, _ => new List<TranscriptSegment>());
    }

    public IReadOnlyList<TranscriptSegment> GetSegments(Guid transcriptId) =>
        _segments.GetValueOrDefault(transcriptId) ?? new List<TranscriptSegment>();

    public void ReplaceSegments(Guid transcriptId, IReadOnlyList<TranscriptSegment> segments)
    {
        var list = _segments.GetOrAdd(transcriptId, _ => new List<TranscriptSegment>());
        lock (list)
        {
            list.Clear();
            list.AddRange(segments);
        }
    }
}
