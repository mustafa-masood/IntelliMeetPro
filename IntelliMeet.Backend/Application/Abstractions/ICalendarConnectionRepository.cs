using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface ICalendarConnectionRepository
{
    IReadOnlyList<CalendarConnection> GetAll();
    CalendarConnection? GetById(Guid id);
    CalendarConnection? GetByExternalId(string externalCalendarId);
    void Upsert(CalendarConnection connection);
    void Remove(Guid id);
}
