using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryMeetingRepository : IMeetingRepository
{
    private readonly ConcurrentDictionary<Guid, Meeting> _store = new();

    public IReadOnlyList<Meeting> GetAll() => _store.Values.OrderByDescending(m => m.StartUtc).ToList();

    public Meeting? GetById(Guid id) => _store.GetValueOrDefault(id);

    public void Upsert(Meeting meeting) => _store[meeting.Id] = meeting;

    public IReadOnlyList<Meeting> GetUpcoming(DateTimeOffset now, int take) =>
        _store.Values
            .Where(m => m.StartUtc.HasValue && m.StartUtc >= now)
            .OrderBy(m => m.StartUtc)
            .Take(take)
            .ToList();
}
