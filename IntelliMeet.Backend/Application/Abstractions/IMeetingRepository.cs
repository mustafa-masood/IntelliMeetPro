using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IMeetingRepository
{
    IReadOnlyList<Meeting> GetAll();

    /// <summary>User-visible meetings for a workspace (excludes unrelated tenants).</summary>
    IReadOnlyList<Meeting> ListForWorkspace(Guid workspaceId);
    Meeting? GetById(Guid id);
    Meeting? GetTrackedById(Guid id);
    Meeting? GetByGoogleCalendarEvent(Guid organizerUserId, string googleEventId);
    IReadOnlyList<Meeting> ListCalendarMeetingsForBotDispatch(DateTimeOffset windowStart, DateTimeOffset windowEnd);
    void Upsert(Meeting meeting);
    IReadOnlyList<Meeting> GetUpcoming(DateTimeOffset now, int take);
}
