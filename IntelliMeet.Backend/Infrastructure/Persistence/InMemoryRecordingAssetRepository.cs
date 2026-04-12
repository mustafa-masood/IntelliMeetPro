using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryRecordingAssetRepository : IRecordingAssetRepository
{
    private readonly ConcurrentDictionary<Guid, RecordingAsset> _store = new();

    public IReadOnlyList<RecordingAsset> GetByMeetingId(Guid meetingId) =>
        _store.Values.Where(a => a.MeetingId == meetingId).ToList();

    public void Upsert(RecordingAsset asset) => _store[asset.Id] = asset;

    public void RemoveForMeeting(Guid meetingId)
    {
        foreach (var key in _store.Where(kv => kv.Value.MeetingId == meetingId).Select(kv => kv.Key).ToList())
            _store.TryRemove(key, out _);
    }
}
