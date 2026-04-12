using IntelliMeet.Backend.Application.DTOs;

namespace IntelliMeet.Backend.Application.Services;

public interface IDashboardService
{
    Task<IReadOnlyList<UpcomingMeetingCardDto>> GetUpcomingMeetingsAsync(CancellationToken ct);
    Task<IReadOnlyList<DashboardCalendarEntryDto>> GetCalendarFeedAsync(CancellationToken ct);
    Task<BotJoinResponseDto> RequestBotJoinAsync(BotJoinRequestDto request, CancellationToken ct);
}
