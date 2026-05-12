using System.Globalization;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Application.Integration;
using IntelliMeet.Backend.Application.Services;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;
using IntelliMeet.Backend.Infrastructure.Api;
using IntelliMeet.Backend.Infrastructure.GoogleAuth;
using IntelliMeet.Backend.Infrastructure.MeetingBaas;
using IntelliMeet.Backend.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("api/meetings")]
public sealed class MeetingCreationController : ControllerBase
{
    /// <summary>Meeting BaaS <c>join_at</c> must match strict ISO8601 with a <c>Z</c> suffix (see API docs); round-trip "o" format can be rejected.</summary>
    private static string FormatMeetingBaasJoinAtUtc(DateTimeOffset when) =>
        when.ToUniversalTime().ToString("yyyy-MM-dd'T'HH:mm:ss'Z'", CultureInfo.InvariantCulture);

    private static string? SanitizeOptionalMeetingBaasString(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string ResolveBotName(MeetingBaasOptions o) =>
        string.IsNullOrWhiteSpace(o.DefaultBotName) ? "IntelliMeet Notetaker" : o.DefaultBotName.Trim();

    private static string BotScheduleFailureMessage(MeetingBaasResult<CreateBotResponseData> botRes)
    {
        var msg = botRes.ErrorMessage?.Trim();
        if (string.IsNullOrEmpty(msg) ||
            string.Equals(msg, "Bad Request", StringComparison.OrdinalIgnoreCase))
        {
            var raw = botRes.RawBody?.Trim();
            if (!string.IsNullOrEmpty(raw))
            {
                const int max = 1200;
                return raw.Length <= max ? raw : raw[..max] + "…";
            }
        }

        return string.IsNullOrEmpty(msg)
            ? "Meeting created but bot scheduling failed."
            : msg;
    }

    private readonly IGoogleCalendarClient _googleCalendar;
    private readonly IGoogleOAuthService _googleOAuth;
    private readonly IUserRepository _users;
    private readonly IMeetingRepository _meetings;
    private readonly IMeetingBotRepository _bots;
    private readonly IMeetingBaasClient _meetingBaas;
    private readonly ICalendarEventRepository _calendarEvents;
    private readonly IOptions<IntegrationsOptions> _integrationOptions;
    private readonly IOptions<MeetingBaasOptions> _meetingBaasOptions;
    private readonly ICurrentUserContext _currentUser;
    private readonly IMeetingTeamResolver _meetingTeam;

    public MeetingCreationController(
        IGoogleCalendarClient googleCalendar,
        IGoogleOAuthService googleOAuth,
        IUserRepository users,
        IMeetingRepository meetings,
        IMeetingBotRepository bots,
        IMeetingBaasClient meetingBaas,
        ICalendarEventRepository calendarEvents,
        IOptions<IntegrationsOptions> integrationOptions,
        IOptions<MeetingBaasOptions> meetingBaasOptions,
        ICurrentUserContext currentUser,
        IMeetingTeamResolver meetingTeam)
    {
        _googleCalendar = googleCalendar;
        _googleOAuth = googleOAuth;
        _users = users;
        _meetings = meetings;
        _bots = bots;
        _meetingBaas = meetingBaas;
        _calendarEvents = calendarEvents;
        _integrationOptions = integrationOptions;
        _meetingBaasOptions = meetingBaasOptions;
        _currentUser = currentUser;
        _meetingTeam = meetingTeam;
    }

    private Guid ResolveUserId() =>
        _currentUser.IsResolved ? _currentUser.UserId : IntegrationUserResolver.ResolveUserId(Request, _integrationOptions);

    [HttpPost("create-from-ui")]
    public async Task<ActionResult<CreateMeetingFromUiResponseDto>> CreateFromUi(
        [FromBody] CreateMeetingFromUiRequestDto body,
        CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        if (body.EndUtc <= body.StartUtc)
            return BadRequest("endUtc must be greater than startUtc.");
        if (!string.IsNullOrWhiteSpace(body.Provider) &&
            !string.Equals(body.Provider, "google", StringComparison.OrdinalIgnoreCase))
        {
            // TODO(Mustafa): implement outlook/generic provider create flow.
            return BadRequest("Only provider=google is currently supported.");
        }

        var userId = ResolveUserId();
        var user = _users.GetTrackedById(userId);
        if (user is null)
            return BadRequest("User not found.");
        if (string.IsNullOrWhiteSpace(user.GoogleRefreshToken))
            return BadRequest("Google calendar is not connected for this user.");

        if (string.IsNullOrWhiteSpace(user.GoogleAccessToken) ||
            user.GoogleTokenExpiryUtc is null ||
            user.GoogleTokenExpiryUtc <= DateTimeOffset.UtcNow.AddMinutes(5))
        {
            var refreshed = await _googleOAuth.RefreshAccessTokenAsync(user.GoogleRefreshToken!, ct).ConfigureAwait(false);
            if (!refreshed.Success || string.IsNullOrWhiteSpace(refreshed.AccessToken))
                return BadRequest(refreshed.Error ?? "Could not refresh Google access token.");
            user.GoogleAccessToken = refreshed.AccessToken;
            user.GoogleTokenExpiryUtc = DateTimeOffset.UtcNow.AddSeconds(Math.Max(60, refreshed.ExpiresInSeconds));
            _users.Upsert(user);
        }

        var g = await _googleCalendar.CreateEventWithConferenceAsync(
            user.GoogleAccessToken!,
            new GoogleCreateEventRequest
            {
                Title = body.Title.Trim(),
                StartUtc = body.StartUtc,
                EndUtc = body.EndUtc,
                Attendees = body.Attendees ?? Array.Empty<string>()
            },
            ct).ConfigureAwait(false);

        if (string.IsNullOrWhiteSpace(g.MeetingUrl))
        {
            // TODO(Mustafa): fallback to another conference provider when Meet link is unavailable.
            return BadRequest("Google event was created but no meeting link was returned.");
        }

        var now = DateTimeOffset.UtcNow;
        var meeting = new Meeting
        {
            Id = Guid.NewGuid(),
            WorkspaceId = user.WorkspaceId,
            TeamId = _meetingTeam.ResolveTeamForNewMeeting(userId, user.WorkspaceId, body.TeamId),
            OrganizerUserId = userId,
            Title = body.Title.Trim(),
            Platform = "google_meet",
            MeetingUrl = g.MeetingUrl!,
            StartUtc = body.StartUtc,
            EndUtc = body.EndUtc,
            Participants = (body.Attendees ?? Array.Empty<string>()).Where(x => !string.IsNullOrWhiteSpace(x)).ToArray(),
            Status = MeetingStatus.Scheduled,
            IsFromCalendar = true,
            IsCancelledFromCalendar = false,
            BotScheduleEnabled = true,
            GoogleCalendarEventId = g.EventId,
            GoogleCalendarHtmlLink = g.HtmlLink,
            CreatedAt = now,
            UpdatedAt = now
        };
        MeetingDomainStateMachine.MarkMeetingScheduled(meeting, now);
        _meetings.Upsert(meeting);

        var calEv = new CalendarEvent
        {
            Id = Guid.NewGuid(),
            CalendarConnectionId = Guid.Empty,
            ExternalEventId = g.EventId,
            Title = meeting.Title,
            StartUtc = body.StartUtc,
            EndUtc = body.EndUtc,
            MeetingUrl = meeting.MeetingUrl,
            IsRecurring = false,
            IsCancelled = false,
            LinkedMeetingId = meeting.Id,
            UpdatedAt = now
        };
        _calendarEvents.Upsert(calEv);
        meeting.CalendarEventId = calEv.Id;
        _meetings.Upsert(meeting);

        // v2/bots joins immediately; future calendar slots need v2/bots/scheduled with join_at or the API fails
        // after Google already created the event (orphan invites + 400 to the UI).
        const int immediateJoinWithinMinutes = 2;
        var mbOpts = _meetingBaasOptions.Value;
        var botName = ResolveBotName(mbOpts);
        var botImage = SanitizeOptionalMeetingBaasString(mbOpts.BotImageUrl);
        var entryMessage = SanitizeOptionalMeetingBaasString(mbOpts.BotEntryMessage);
        MeetingBaasResult<CreateBotResponseData> botRes;
        var useScheduledJoin = body.StartUtc > DateTimeOffset.UtcNow.AddMinutes(immediateJoinWithinMinutes);
        if (useScheduledJoin)
        {
            var schedReq = new ScheduledBotRequest
            {
                MeetingUrl = meeting.MeetingUrl,
                BotName = botName,
                BotImage = botImage,
                EntryMessage = entryMessage,
                RecordingMode = "speaker_view",
                JoinAt = FormatMeetingBaasJoinAtUtc(body.StartUtc)
            };
            botRes = await _meetingBaas.CreateScheduledBotAsync(schedReq, ct).ConfigureAwait(false);
        }
        else
        {
            var botReq = new CreateBotRequest
            {
                MeetingUrl = meeting.MeetingUrl,
                BotName = botName,
                BotImage = botImage,
                EntryMessage = entryMessage,
                RecordingMode = "speaker_view",
                // transcription_config is required when transcription_enabled is true; keep off for ad-hoc joins unless configured.
                TranscriptionEnabled = false
            };
            botRes = await _meetingBaas.CreateBotAsync(botReq, ct).ConfigureAwait(false);
        }

        var already = false;
        var externalBotId = botRes.Data?.BotId?.Trim();
        if (!botRes.Success || string.IsNullOrWhiteSpace(externalBotId))
        {
            // TODO(Mustafa): strict idempotency key for bot scheduling per meeting.
            already = (botRes.ErrorMessage ?? string.Empty).Contains("already", StringComparison.OrdinalIgnoreCase);
            if (!already)
                return BadRequest(BotScheduleFailureMessage(botRes));
        }

        if (!already)
        {
            var botId = externalBotId!;
            _bots.Upsert(new MeetingBot
            {
                Id = Guid.NewGuid(),
                MeetingId = meeting.Id,
                ExternalBotId = botId,
                Status = useScheduledJoin ? BotOperationalStatus.ScheduledPending : BotOperationalStatus.Queued,
                TranscriptionStatus = TranscriptStatus.Pending,
                IsScheduled = true,
                JoinAtUtc = meeting.StartUtc,
                CreatedAt = now,
                UpdatedAt = now
            });
            meeting.BotScheduledAtUtc = now;
            meeting.BotJobId = botId;
            _meetings.Upsert(meeting);
        }

        return Ok(new CreateMeetingFromUiResponseDto
        {
            MeetingId = meeting.Id,
            CalendarEventId = meeting.CalendarEventId,
            GoogleCalendarEventId = meeting.GoogleCalendarEventId,
            MeetingUrl = meeting.MeetingUrl,
            BotScheduled = !already,
            BotAlreadyScheduled = already
        });
    }

    [HttpGet("upcoming-calendar")]
    public ActionResult<IReadOnlyList<CalendarMeetingListItemDto>> UpcomingCalendar(CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        var userId = ResolveUserId();
        var now = DateTimeOffset.UtcNow;
        var user = _users.GetById(userId);
        var scope = user?.WorkspaceId is Guid w && w != Guid.Empty
            ? _meetings.ListForWorkspace(w)
            : _meetings.GetAll().Where(m => m.OrganizerUserId == userId);
        if (_currentUser.IsResolved &&
            _currentUser.WorkspaceId != Guid.Empty &&
            _currentUser.Role == WorkspaceMemberRole.Member &&
            _currentUser.TeamId.HasValue)
        {
            scope = scope.Where(m => m.TeamId.HasValue && m.TeamId.Value == _currentUser.TeamId.Value).ToList();
        }
        var list = scope
            .Where(m => m.IsFromCalendar && !m.IsCancelledFromCalendar && m.StartUtc >= now)
            .OrderBy(m => m.StartUtc)
            .Select(MapCalendarMeeting)
            .ToList();
        return Ok(list);
    }

    [HttpGet("past")]
    public ActionResult<IReadOnlyList<CalendarMeetingListItemDto>> Past(CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        var userId = ResolveUserId();
        var now = DateTimeOffset.UtcNow;
        var from = now.AddDays(-7);
        var user = _users.GetById(userId);
        var scope = user?.WorkspaceId is Guid w && w != Guid.Empty
            ? _meetings.ListForWorkspace(w)
            : _meetings.GetAll().Where(m => m.OrganizerUserId == userId);
        if (_currentUser.IsResolved &&
            _currentUser.WorkspaceId != Guid.Empty &&
            _currentUser.Role == WorkspaceMemberRole.Member &&
            _currentUser.TeamId.HasValue)
        {
            scope = scope.Where(m => m.TeamId.HasValue && m.TeamId.Value == _currentUser.TeamId.Value).ToList();
        }
        var list = scope
            .Where(m => m.IsFromCalendar && m.StartUtc >= from && m.StartUtc < now)
            .OrderByDescending(m => m.StartUtc)
            .Select(MapCalendarMeeting)
            .ToList();
        return Ok(list);
    }

    private static CalendarMeetingListItemDto MapCalendarMeeting(Meeting m) => new()
    {
        MeetingId = m.Id,
        Title = m.Title,
        StartUtc = m.StartUtc,
        EndUtc = m.EndUtc,
        MeetingUrl = m.MeetingUrl,
        BotScheduled = m.BotScheduledAtUtc != null,
        BotScheduledAtUtc = m.BotScheduledAtUtc,
        CalendarEventLink = m.GoogleCalendarHtmlLink,
        TranscriptReady = m.ProcessingStatus == MeetingProcessingStatus.AnalysisComplete,
        IsPast = m.StartUtc < DateTimeOffset.UtcNow
    };
}
