using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryCalendarEventRepository : ICalendarEventRepository
{
    private readonly ConcurrentDictionary<Guid, CalendarEvent> _store = new();

    public IReadOnlyList<CalendarEvent> GetByCalendarId(Guid calendarConnectionId) =>
        _store.Values.Where(e => e.CalendarConnectionId == calendarConnectionId).OrderBy(e => e.StartUtc).ToList();

    public CalendarEvent? GetById(Guid id) => _store.GetValueOrDefault(id);

    public CalendarEvent? FindByExternal(Guid calendarConnectionId, string externalEventId) =>
        _store.Values.FirstOrDefault(e =>
            e.CalendarConnectionId == calendarConnectionId && e.ExternalEventId == externalEventId);

    public void Upsert(CalendarEvent evt) => _store[evt.Id] = evt;

    public void UpsertMany(IReadOnlyList<CalendarEvent> events)
    {
        foreach (var e in events)
            _store[e.Id] = e;
    }

    public IReadOnlyList<CalendarEvent> GetUpcoming(Guid calendarConnectionId, DateTimeOffset now, int take) =>
        _store.Values
            .Where(e => e.CalendarConnectionId == calendarConnectionId && !e.IsCancelled && e.StartUtc >= now)
            .OrderBy(e => e.StartUtc)
            .Take(take)
            .ToList();
}
