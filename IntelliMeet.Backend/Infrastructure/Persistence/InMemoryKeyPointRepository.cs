using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryKeyPointRepository : IKeyPointRepository
{
    private readonly ConcurrentDictionary<Guid, List<KeyPoint>> _byMeeting = new();

    public IReadOnlyList<KeyPoint> GetByMeetingId(Guid meetingId) =>
        _byMeeting.GetValueOrDefault(meetingId) ?? new List<KeyPoint>();

    public void ReplaceForMeeting(Guid meetingId, IReadOnlyList<KeyPoint> keyPoints)
    {
        var list = _byMeeting.GetOrAdd(meetingId, _ => new List<KeyPoint>());
        lock (list)
        {
            list.Clear();
            list.AddRange(keyPoints);
        }
    }
}
