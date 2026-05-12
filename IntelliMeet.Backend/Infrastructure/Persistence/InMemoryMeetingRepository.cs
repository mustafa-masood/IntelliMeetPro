using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryMeetingRepository : IMeetingRepository
{
    private readonly ConcurrentDictionary<Guid, Meeting> _store = new();

    public IReadOnlyList<Meeting> GetAll() => _store.Values.OrderByDescending(m => m.StartUtc).ToList();

    public IReadOnlyList<Meeting> ListForWorkspace(Guid workspaceId) =>
        _store.Values.Where(m => m.WorkspaceId == workspaceId).OrderByDescending(m => m.StartUtc).ToList();

    public Meeting? GetById(Guid id) => _store.GetValueOrDefault(id);

    public Meeting? GetTrackedById(Guid id) => GetById(id);

    public Meeting? GetByGoogleCalendarEvent(Guid organizerUserId, string googleEventId) =>
        _store.Values.FirstOrDefault(m =>
            m.OrganizerUserId == organizerUserId && m.GoogleCalendarEventId == googleEventId);

    public IReadOnlyList<Meeting> ListCalendarMeetingsForBotDispatch(DateTimeOffset windowStart, DateTimeOffset windowEnd) =>
        _store.Values
            .Where(m =>
                m.IsFromCalendar &&
                m.BotScheduleEnabled &&
                !m.IsCancelledFromCalendar &&
                m.BotScheduledAtUtc == null &&
                m.StartUtc != null &&
                m.StartUtc >= windowStart &&
                m.StartUtc <= windowEnd &&
                !string.IsNullOrEmpty(m.MeetingUrl))
            .ToList();

    public void Upsert(Meeting meeting) => _store[meeting.Id] = meeting;

    public IReadOnlyList<Meeting> GetUpcoming(DateTimeOffset now, int take) =>
        _store.Values
            .Where(m => m.StartUtc.HasValue && m.StartUtc >= now)
            .OrderBy(m => m.StartUtc)
            .Take(take)
            .ToList();
}
