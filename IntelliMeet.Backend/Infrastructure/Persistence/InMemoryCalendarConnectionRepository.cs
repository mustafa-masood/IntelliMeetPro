using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryCalendarConnectionRepository : ICalendarConnectionRepository
{
    private readonly ConcurrentDictionary<Guid, CalendarConnection> _store = new();

    public IReadOnlyList<CalendarConnection> GetAll() => _store.Values.OrderBy(c => c.CreatedAt).ToList();

    public CalendarConnection? GetById(Guid id) => _store.GetValueOrDefault(id);

    public CalendarConnection? GetByExternalId(string externalCalendarId) =>
        _store.Values.FirstOrDefault(c => c.ExternalCalendarId == externalCalendarId);

    public void Upsert(CalendarConnection connection) => _store[connection.Id] = connection;

    public void Remove(Guid id) => _store.TryRemove(id, out _);
}
