using IntelliMeet.Backend.Application.Integration;

namespace IntelliMeet.Backend.Application.Abstractions;

/// <summary>HTTP wrapper for Meeting BaaS API v2. Controllers must not use this directly.</summary>
public interface IMeetingBaasClient
{
    Task<MeetingBaasResult<CreateBotResponseData>> CreateBotAsync(CreateBotRequest body, CancellationToken ct);
    Task<MeetingBaasResult<CreateBotResponseData>> CreateScheduledBotAsync(ScheduledBotRequest body, CancellationToken ct);
    Task<MeetingBaasResult<BotDetailsData>> GetBotAsync(string botId, CancellationToken ct);
    Task<MeetingBaasResult<BotsListPageResult>> ListBotsAsync(ListBotsQuery query, CancellationToken ct);
    Task<MeetingBaasResult<ScheduledBotsListPageResult>> ListScheduledBotsAsync(ListScheduledBotsQuery query, CancellationToken ct);
    Task<MeetingBaasResult<ScheduledBotDetailsData>> GetScheduledBotDetailsAsync(string scheduledBotId, CancellationToken ct);
    Task<MeetingBaasResult<BotStatusData>> GetBotStatusAsync(string botId, CancellationToken ct);
    Task<MeetingBaasResult<MessageData>> LeaveBotAsync(string botId, CancellationToken ct);
    Task<MeetingBaasResult<DeleteBotDataResponse>> DeleteBotDataAsync(string botId, CancellationToken ct);
    Task<MeetingBaasResult<object>> CancelScheduledBotAsync(string scheduledBotId, CancellationToken ct);

    Task<MeetingBaasResult<IReadOnlyList<RawCalendarListItemData>>> ListRawCalendarsAsync(ListRawCalendarsRequest body, CancellationToken ct);
    Task<MeetingBaasResult<CalendarCreatedData>> CreateCalendarConnectionAsync(CreateCalendarRequest body, CancellationToken ct);
    Task<MeetingBaasResult<IReadOnlyList<CalendarListItemData>>> ListCalendarsAsync(ListCalendarsQuery? query, CancellationToken ct);
    Task<MeetingBaasResult<CalendarDetailData>> GetCalendarAsync(string calendarId, CancellationToken ct);
    Task<MeetingBaasResult<object>> SyncCalendarAsync(string calendarId, CancellationToken ct);
    Task<MeetingBaasResult<CalendarEventsPageData>> GetCalendarEventsAsync(string calendarId, CancellationToken ct);
    Task<MeetingBaasResult<ScheduleCalendarBotData>> ScheduleBotForEventAsync(string calendarId, ScheduleCalendarBotRequest body, CancellationToken ct);
    Task<MeetingBaasResult<object>> DeleteCalendarConnectionAsync(string calendarId, CancellationToken ct);
}
