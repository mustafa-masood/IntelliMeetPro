using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface ICalendarEventRepository
{
    IReadOnlyList<CalendarEvent> GetByCalendarId(Guid calendarConnectionId);
    CalendarEvent? GetById(Guid id);
    CalendarEvent? FindByExternal(Guid calendarConnectionId, string externalEventId);
    void Upsert(CalendarEvent evt);
    void UpsertMany(IReadOnlyList<CalendarEvent> events);
    IReadOnlyList<CalendarEvent> GetUpcoming(Guid calendarConnectionId, DateTimeOffset now, int take);
    void RemoveByCalendarConnection(Guid calendarConnectionId);
}
