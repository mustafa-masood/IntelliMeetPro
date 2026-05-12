using System.Text.Json;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Application.Integration;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;
using IntelliMeet.Backend.Infrastructure.Api;
using IntelliMeet.Backend.Infrastructure.MeetingBaas;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Application.Services;

public sealed class DashboardService : IDashboardService
{
    private readonly IMeetingRepository _meetings;
    private readonly IMeetingBotRepository _bots;
    private readonly ICalendarEventRepository _events;
    private readonly ICalendarConnectionRepository _calendars;
    private readonly IUserRepository _users;
    private readonly IMeetingBaasClient _mb;
    private readonly IOptions<MeetingBaasOptions> _meetingBaasOpt;
    private readonly ICurrentUserContext _currentUser;
    private readonly IMeetingTeamResolver _meetingTeam;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(
        IMeetingRepository meetings,
        IMeetingBotRepository bots,
        ICalendarEventRepository events,
        ICalendarConnectionRepository calendars,
        IUserRepository users,
        IMeetingBaasClient mb,
        IOptions<MeetingBaasOptions> meetingBaasOpt,
        ICurrentUserContext currentUser,
        IMeetingTeamResolver meetingTeam,
        ILogger<DashboardService> logger)
    {
        _meetings = meetings;
        _bots = bots;
        _events = events;
        _calendars = calendars;
        _users = users;
        _mb = mb;
        _meetingBaasOpt = meetingBaasOpt;
        _currentUser = currentUser;
        _meetingTeam = meetingTeam;
        _logger = logger;
    }

    public async Task<IReadOnlyList<UpcomingMeetingCardDto>> GetUpcomingMeetingsAsync(CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var list = new List<UpcomingMeetingCardDto>();

        var calendarConnections = ResolveCalendarConnections();
        foreach (var cal in calendarConnections)
        {
            foreach (var ev in _events.GetUpcoming(cal.Id, now, 50))
            {
                Meeting? linked = null;
                MeetingBot? bot = null;
                if (ev.LinkedMeetingId.HasValue)
                {
                    linked = _meetings.GetById(ev.LinkedMeetingId.Value);
                    if (linked is not null && !CanAccessMeeting(linked))
                        continue;
                    var bots = linked is null ? Array.Empty<MeetingBot>() : _bots.GetByMeetingId(linked.Id);
                    bot = bots.FirstOrDefault();
                }
                list.Add(new UpcomingMeetingCardDto
                {
                    MeetingId = linked?.Id ?? Guid.Empty,
                    Title = ev.Title,
                    StartUtc = ev.StartUtc,
                    EndUtc = ev.EndUtc,
                    MeetingUrl = ev.MeetingUrl ?? linked?.MeetingUrl ?? string.Empty,
                    BotStatus = bot?.Status.ToString() ?? (ev.LinkedMeetingId.HasValue ? "scheduled" : "none"),
                    ExternalBotId = bot?.ExternalBotId,
                    CalendarEventTitle = ev.Title,
                    CalendarEventId = ev.Id
                });
            }
        }

        var upcomingMeetings = _meetings.GetUpcoming(now, 50);
        if (_currentUser.IsResolved && _currentUser.WorkspaceId != Guid.Empty)
        {
            upcomingMeetings = upcomingMeetings.Where(m => m.WorkspaceId == _currentUser.WorkspaceId).ToList();
            if (_currentUser.Role == WorkspaceMemberRole.Member && _currentUser.TeamId.HasValue)
                upcomingMeetings = upcomingMeetings
                    .Where(m => m.TeamId.HasValue && m.TeamId.Value == _currentUser.TeamId.Value).ToList();
        }

        foreach (var m in upcomingMeetings)
        {
            if (!CanAccessMeeting(m))
                continue;
            if (list.Any(x => x.MeetingId == m.Id))
                continue;
            var bot = _bots.GetByMeetingId(m.Id).FirstOrDefault();
            list.Add(new UpcomingMeetingCardDto
            {
                MeetingId = m.Id,
                Title = m.Title,
                StartUtc = m.StartUtc,
                EndUtc = m.EndUtc,
                MeetingUrl = m.MeetingUrl,
                BotStatus = bot?.Status.ToString() ?? "none",
                ExternalBotId = bot?.ExternalBotId,
                CalendarEventId = m.CalendarEventId
            });
        }
        return list.OrderBy(x => x.StartUtc ?? DateTimeOffset.MaxValue).ToList();
    }

    public Task<IReadOnlyList<DashboardCalendarEntryDto>> GetCalendarFeedAsync(CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var end = now.AddDays(42);
        var result = new List<DashboardCalendarEntryDto>();
        foreach (var cal in ResolveCalendarConnections())
        {
            foreach (var ev in _events.GetByCalendarId(cal.Id))
            {
                if (ev.StartUtc < now || ev.StartUtc > end || ev.IsCancelled)
                    continue;
                result.Add(new DashboardCalendarEntryDto
                {
                    CalendarEventId = ev.Id,
                    CalendarConnectionId = cal.Id,
                    Title = ev.Title,
                    StartUtc = ev.StartUtc,
                    EndUtc = ev.EndUtc,
                    MeetingUrl = ev.MeetingUrl,
                    HasScheduledBot = ev.LinkedMeetingId.HasValue
                });
            }
        }
        return Task.FromResult<IReadOnlyList<DashboardCalendarEntryDto>>(result.OrderBy(e => e.StartUtc).ToList());
    }

    public async Task<BotJoinResponseDto> RequestBotJoinAsync(BotJoinRequestDto request, CancellationToken ct)
    {
        var meetingId = Guid.NewGuid();
        var botLocalId = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;

        var mbOpt = _meetingBaasOpt.Value;
        var botName = string.IsNullOrWhiteSpace(request.BotName)
            ? mbOpt.DefaultBotName
            : request.BotName.Trim();
        var createReq = new CreateBotRequest
        {
            MeetingUrl = request.MeetingUrl,
            BotName = botName,
            BotImage = string.IsNullOrWhiteSpace(mbOpt.BotImageUrl) ? null : mbOpt.BotImageUrl.Trim(),
            EntryMessage = string.IsNullOrWhiteSpace(mbOpt.BotEntryMessage) ? null : mbOpt.BotEntryMessage.Trim(),
            RecordingMode = request.RecordingMode ?? "speaker_view",
            TranscriptionEnabled = request.TranscriptionEnabled,
            TranscriptionConfig = request.TranscriptionEnabled
                ? JsonSerializer.SerializeToElement(new { provider = "gladia" }, MbJson.Options)
                : null
        };

        var mb = await _mb.CreateBotAsync(createReq, ct).ConfigureAwait(false);
        if (!mb.Success || string.IsNullOrWhiteSpace(mb.Data?.BotId))
        {
            _logger.LogWarning("Meeting BaaS create bot failed: {Error}", mb.ErrorMessage);
            throw new InvalidOperationException(mb.ErrorMessage ?? "Meeting BaaS did not return a bot id. Check ApiKey and meeting URL.");
        }

        Guid organizerId;
        if (_currentUser.IsResolved)
            organizerId = _currentUser.UserId;
        else if (request.UserId is Guid legacyUid)
            organizerId = legacyUid;
        else
            throw new InvalidOperationException("User id is required to join a meeting.");

        var orgUser = _users.GetById(organizerId) ?? throw new InvalidOperationException("User not found.");
        var workspaceId = orgUser.WorkspaceId;
        var teamId = _meetingTeam.ResolveTeamForNewMeeting(organizerId, workspaceId, null);

        var meeting = new Meeting
        {
            Id = meetingId,
            WorkspaceId = workspaceId,
            TeamId = teamId,
            OrganizerUserId = organizerId,
            Title = $"Meeting {now:yyyy-MM-dd HH:mm}",
            Platform = InferPlatform(request.MeetingUrl),
            MeetingUrl = request.MeetingUrl,
            StartUtc = now,
            EndUtc = null,
            Participants = Array.Empty<string>(),
            Status = MeetingStatus.Live,
            CalendarEventId = null,
            CreatedAt = now,
            UpdatedAt = now
        };
        MeetingDomainStateMachine.MarkMeetingLive(meeting, now);
        _meetings.Upsert(meeting);

        var status = BotStatusMapper.FromMeetingBaas("queued");
        var bot = new MeetingBot
        {
            Id = botLocalId,
            MeetingId = meetingId,
            ExternalBotId = mb.Data.BotId,
            Status = status,
            TranscriptionStatus = request.TranscriptionEnabled ? TranscriptStatus.Pending : TranscriptStatus.None,
            IsScheduled = false,
            JoinAtUtc = null,
            CreatedAt = now,
            UpdatedAt = now
        };
        MeetingDomainStateMachine.MarkBotQueued(bot, request.TranscriptionEnabled, now);
        _bots.Upsert(bot);

        return new BotJoinResponseDto
        {
            MeetingId = meetingId,
            MeetingBotId = botLocalId,
            ExternalBotId = mb.Data.BotId,
            Status = status.ToString()
        };
    }

    private IReadOnlyList<CalendarConnection> ResolveCalendarConnections()
    {
        if (_currentUser.IsResolved)
            return _calendars.ListForUser(_currentUser.UserId);
        return _calendars.GetAll();
    }

    private bool CanAccessMeeting(Meeting? m)
    {
        if (m is null) return false;
        if (!_currentUser.IsResolved || _currentUser.WorkspaceId == Guid.Empty) return true;
        if (!m.WorkspaceId.HasValue) return false;
        if (m.WorkspaceId.Value != _currentUser.WorkspaceId) return false;
        if (_currentUser.Role == WorkspaceMemberRole.Member && _currentUser.TeamId.HasValue)
            return m.TeamId.HasValue && m.TeamId.Value == _currentUser.TeamId.Value;
        return true;
    }

    private static string InferPlatform(string url)
    {
        var u = url.ToLowerInvariant();
        if (u.Contains("meet.google")) return "google_meet";
        if (u.Contains("teams.microsoft") || u.Contains("teams.live")) return "teams";
        if (u.Contains("zoom.us")) return "zoom";
        return "unknown";
    }
}
