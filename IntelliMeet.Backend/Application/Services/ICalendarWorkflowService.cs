using IntelliMeet.Backend.Application.DTOs;

namespace IntelliMeet.Backend.Application.Services;

public interface ICalendarWorkflowService
{
    Task<IReadOnlyList<RawCalendarItemDto>> ListRawGoogleCalendarsAsync(string refreshToken, CancellationToken ct);
    Task<CalendarConnectionDto> ConnectAsync(ConnectCalendarRequestDto request, CancellationToken ct);
    Task<IReadOnlyList<CalendarConnectionDto>> ListAsync(Guid userId, CancellationToken ct);
    Task DisconnectAsync(Guid connectionId, Guid userId, CancellationToken ct);
    Task<CalendarConnectionDto?> GetAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<CalendarEventDto>> ListEventsAsync(Guid calendarId, CancellationToken ct);
    Task SyncAsync(Guid calendarId, CancellationToken ct);
    Task<ScheduleCalendarBotResponseDto> ScheduleBotAsync(Guid calendarId, ScheduleCalendarBotRequestDto body, CancellationToken ct);
}
