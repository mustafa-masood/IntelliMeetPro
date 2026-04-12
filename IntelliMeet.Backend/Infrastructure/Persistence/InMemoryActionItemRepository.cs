using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryActionItemRepository : IActionItemRepository
{
    private readonly ConcurrentDictionary<Guid, ActionItem> _store = new();

    public IReadOnlyList<ActionItem> GetByMeetingId(Guid meetingId) =>
        _store.Values.Where(a => a.MeetingId == meetingId).OrderBy(a => a.Title).ToList();

    public ActionItem? GetById(Guid id) => _store.GetValueOrDefault(id);

    public void Upsert(ActionItem item) => _store[item.Id] = item;

    public void RemoveByMeetingIdAndSource(Guid meetingId, string source)
    {
        foreach (var id in _store.Where(kv => kv.Value.MeetingId == meetingId && string.Equals(kv.Value.Source, source, StringComparison.Ordinal))
                     .Select(kv => kv.Key)
                     .ToList())
            _store.TryRemove(id, out _);
    }
}
