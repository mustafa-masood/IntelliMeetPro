using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Application.Integration;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Application.Services;

public sealed class CalendarWorkflowService : ICalendarWorkflowService
{
    private readonly ICalendarConnectionRepository _connections;
    private readonly ICalendarEventRepository _events;
    private readonly IIntegrationCredentialsRepository _credentials;
    private readonly IMeetingBaasClient _mb;
    private readonly IMeetingRepository _meetings;
    private readonly IMeetingBotRepository _bots;
    private readonly GoogleOAuthOptions _google;
    private readonly ILogger<CalendarWorkflowService> _logger;

    public CalendarWorkflowService(
        ICalendarConnectionRepository connections,
        ICalendarEventRepository events,
        IIntegrationCredentialsRepository credentials,
        IMeetingBaasClient mb,
        IMeetingRepository meetings,
        IMeetingBotRepository bots,
        IOptions<GoogleOAuthOptions> google,
        ILogger<CalendarWorkflowService> logger)
    {
        _connections = connections;
        _events = events;
        _credentials = credentials;
        _mb = mb;
        _meetings = meetings;
        _bots = bots;
        _google = google.Value;
        _logger = logger;
    }

    public async Task<IReadOnlyList<RawCalendarItemDto>> ListRawGoogleCalendarsAsync(string refreshToken, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            throw new ArgumentException("Refresh token is required.", nameof(refreshToken));
        if (string.IsNullOrWhiteSpace(_google.ClientId) || string.IsNullOrWhiteSpace(_google.ClientSecret))
            throw new InvalidOperationException("Google OAuth is not configured (GoogleOAuth:ClientId / ClientSecret).");
        var req = new ListRawCalendarsRequest
        {
            CalendarPlatform = "google",
            OAuthClientId = _google.ClientId,
            OAuthClientSecret = _google.ClientSecret,
            OAuthRefreshToken = refreshToken
        };
        var res = await _mb.ListRawCalendarsAsync(req, ct).ConfigureAwait(false);
        if (!res.Success || res.Data is null)
            throw new InvalidOperationException(res.ErrorMessage ?? "Meeting BaaS list-raw failed.");
        return res.Data.Select(x => new RawCalendarItemDto
        {
            Id = x.Id ?? string.Empty,
            Name = x.Name ?? string.Empty,
            Email = x.Email ?? string.Empty,
            IsPrimary = x.IsPrimary
        }).ToList();
    }

    public async Task<CalendarConnectionDto> ConnectAsync(ConnectCalendarRequestDto request, CancellationToken ct)
    {
        if (request.UserId == Guid.Empty)
            throw new ArgumentException("UserId is required.", nameof(request));
        var clientId = !string.IsNullOrWhiteSpace(request.OAuthClientId) ? request.OAuthClientId! : _google.ClientId;
        var clientSecret = !string.IsNullOrWhiteSpace(request.OAuthClientSecret) ? request.OAuthClientSecret! : _google.ClientSecret;
        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
            throw new InvalidOperationException("OAuth client id/secret must be supplied or configured under GoogleOAuth.");

        var existingForUser = _connections.GetAll()
            .FirstOrDefault(c => c.UserId == request.UserId
                && string.Equals(c.RawCalendarId, request.RawCalendarId, StringComparison.Ordinal));
        if (existingForUser is not null)
        {
            existingForUser.OAuthRefreshToken = request.OAuthRefreshToken;
            existingForUser.UpdatedAt = DateTimeOffset.UtcNow;
            _connections.Upsert(existingForUser);
            try
            {
                await SyncAsync(existingForUser.Id, ct).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Calendar sync after reconnect (local) failed; user can use Sync now.");
            }

            return MapConn(existingForUser);
        }

        var credId = Guid.NewGuid();
        var cred = new IntegrationCredentials
        {
            Id = credId,
            Provider = request.Provider,
            OAuthClientId = clientId,
            OAuthClientSecret = clientSecret,
            OAuthTenantId = request.OAuthTenantId,
            CreatedAt = DateTimeOffset.UtcNow
        };
        _credentials.Upsert(cred);

        var mbReq = new CreateCalendarRequest
        {
            CalendarPlatform = request.Provider == CalendarProvider.Google ? "google" : "microsoft",
            OAuthClientId = clientId,
            OAuthClientSecret = clientSecret,
            OAuthRefreshToken = request.OAuthRefreshToken,
            OAuthTenantId = request.OAuthTenantId,
            RawCalendarId = request.RawCalendarId
        };
        var res = await _mb.CreateCalendarConnectionAsync(mbReq, ct).ConfigureAwait(false);
        var externalCalId = res.Data?.CalendarId ?? res.Data?.Uuid;
        if (!res.Success || string.IsNullOrWhiteSpace(externalCalId))
        {
            if (IsCalendarAlreadyExistsConflict(res))
            {
                externalCalId = await ResolveExternalCalendarIdFromMeetingBaasListAsync(request.RawCalendarId, ct).ConfigureAwait(false);
                if (!string.IsNullOrWhiteSpace(externalCalId))
                    _logger.LogInformation("Resolved existing Meeting BaaS calendar after create conflict (raw id {Raw}).", request.RawCalendarId);
            }

            if (string.IsNullOrWhiteSpace(externalCalId))
            {
                var msg = res.ErrorMessage ?? "Meeting BaaS did not return a calendar id.";
                if (!string.IsNullOrWhiteSpace(res.RawBody) &&
                    (string.Equals(msg, "Bad Request", StringComparison.OrdinalIgnoreCase) || msg.Length < 12))
                {
                    var raw = res.RawBody.Trim();
                    if (raw.Length > 480) raw = raw[..480] + "…";
                    msg = $"{msg} — {raw}";
                }

                throw new InvalidOperationException(msg);
            }
        }

        var byExternal = _connections.GetByExternalId(externalCalId);
        if (byExternal is not null && byExternal.UserId == request.UserId)
        {
            byExternal.RawCalendarId = request.RawCalendarId;
            byExternal.OAuthRefreshToken = request.OAuthRefreshToken;
            byExternal.IntegrationCredentialsId = credId;
            byExternal.Status = "connected";
            byExternal.UpdatedAt = DateTimeOffset.UtcNow;
            _connections.Upsert(byExternal);
            try
            {
                await SyncAsync(byExternal.Id, ct).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Initial calendar sync after connect failed; user can use Sync now.");
            }

            return MapConn(byExternal);
        }

        var now = DateTimeOffset.UtcNow;
        var conn = new CalendarConnection
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Provider = request.Provider,
            ExternalCalendarId = externalCalId,
            RawCalendarId = request.RawCalendarId,
            OAuthRefreshToken = request.OAuthRefreshToken,
            IntegrationCredentialsId = credId,
            Status = "connected",
            LastSyncedAt = null,
            CreatedAt = now,
            UpdatedAt = now
        };
        _connections.Upsert(conn);
        try
        {
            await SyncAsync(conn.Id, ct).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Initial calendar sync after connect failed; user can use Sync now.");
        }
        return MapConn(conn);
    }

    private static bool IsCalendarAlreadyExistsConflict(MeetingBaasResult<CalendarCreatedData> res)
    {
        if (res.StatusCode == 409)
            return true;
        var blob = $"{res.ErrorMessage} {res.RawBody}";
        return blob.Contains("FST_ERR_CALENDAR_CONNECTION_ALREADY_EXISTS", StringComparison.OrdinalIgnoreCase)
               || blob.Contains("already exists", StringComparison.OrdinalIgnoreCase)
               || blob.Contains("Conflict", StringComparison.OrdinalIgnoreCase);
    }

    private async Task<string?> ResolveExternalCalendarIdFromMeetingBaasListAsync(string rawCalendarId, CancellationToken ct)
    {
        var list = await _mb.ListCalendarsAsync(ct).ConfigureAwait(false);
        if (!list.Success || list.Data is null || list.Data.Count == 0)
            return null;
        var match = list.Data.FirstOrDefault(c =>
            string.Equals(c.RawCalendarId, rawCalendarId, StringComparison.Ordinal));
        return match?.CalendarId ?? match?.Uuid;
    }

    public Task<IReadOnlyList<CalendarConnectionDto>> ListAsync(CancellationToken ct) =>
        Task.FromResult<IReadOnlyList<CalendarConnectionDto>>(_connections.GetAll().Select(MapConn).ToList());

    public Task<CalendarConnectionDto?> GetAsync(Guid id, CancellationToken ct)
    {
        var c = _connections.GetById(id);
        return Task.FromResult(c is null ? null : MapConn(c));
    }

    public async Task<IReadOnlyList<CalendarEventDto>> ListEventsAsync(Guid calendarId, CancellationToken ct)
    {
        var cal = _connections.GetById(calendarId) ?? throw new KeyNotFoundException("Calendar connection not found.");
        var page = await _mb.GetCalendarEventsAsync(cal.ExternalCalendarId, ct).ConfigureAwait(false);
        if (page.Success && page.Data?.Events is { Count: > 0 })
            UpsertEventsFromApi(cal.Id, page.Data.Events);
        return _events.GetByCalendarId(calendarId).Select(MapEv).ToList();
    }

    public async Task SyncAsync(Guid calendarId, CancellationToken ct)
    {
        var cal = _connections.GetById(calendarId) ?? throw new KeyNotFoundException("Calendar connection not found.");
        var sync = await _mb.SyncCalendarAsync(cal.ExternalCalendarId, ct).ConfigureAwait(false);
        if (!sync.Success)
            _logger.LogWarning("Calendar sync call failed: {Err}", sync.ErrorMessage);
        var page = await _mb.GetCalendarEventsAsync(cal.ExternalCalendarId, ct).ConfigureAwait(false);
        if (page.Success && page.Data?.Events is { Count: > 0 })
            UpsertEventsFromApi(cal.Id, page.Data.Events);
        cal.LastSyncedAt = DateTimeOffset.UtcNow;
        cal.UpdatedAt = cal.LastSyncedAt.Value;
        _connections.Upsert(cal);
    }

    public async Task<ScheduleCalendarBotResponseDto> ScheduleBotAsync(Guid calendarId, ScheduleCalendarBotRequestDto body, CancellationToken ct)
    {
        var cal = _connections.GetById(calendarId) ?? throw new KeyNotFoundException("Calendar connection not found.");
        var req = new ScheduleCalendarBotRequest
        {
            EventId = body.EventId,
            SeriesId = body.SeriesId,
            AllOccurrences = body.AllOccurrences,
            BotName = body.BotName,
            RecordingMode = body.RecordingMode ?? "speaker_view"
        };
        var res = await _mb.ScheduleBotForEventAsync(cal.ExternalCalendarId, req, ct).ConfigureAwait(false);
        if (!res.Success || string.IsNullOrWhiteSpace(res.Data?.BotId))
            throw new InvalidOperationException(res.ErrorMessage ?? "Failed to schedule bot.");

        var ev = _events.FindByExternal(calendarId, body.EventId);
        var now = DateTimeOffset.UtcNow;
        var meetingId = Guid.NewGuid();
        var meeting = new Meeting
        {
            Id = meetingId,
            OrganizerUserId = cal.UserId,
            Title = ev?.Title ?? $"Calendar event {body.EventId}",
            Platform = InferPlatform(ev?.MeetingUrl),
            MeetingUrl = ev?.MeetingUrl ?? string.Empty,
            StartUtc = ev?.StartUtc,
            EndUtc = ev?.EndUtc,
            Participants = Array.Empty<string>(),
            Status = MeetingStatus.Scheduled,
            CalendarEventId = ev?.Id,
            CreatedAt = now,
            UpdatedAt = now
        };
        _meetings.Upsert(meeting);
        if (ev is not null)
        {
            ev.LinkedMeetingId = meetingId;
            ev.UpdatedAt = now;
            _events.Upsert(ev);
        }
        var bot = new MeetingBot
        {
            Id = Guid.NewGuid(),
            MeetingId = meetingId,
            ExternalBotId = res.Data.BotId,
            Status = BotOperationalStatus.ScheduledPending,
            TranscriptionStatus = TranscriptStatus.Pending,
            IsScheduled = true,
            JoinAtUtc = ev?.StartUtc,
            CreatedAt = now,
            UpdatedAt = now
        };
        _bots.Upsert(bot);
        return new ScheduleCalendarBotResponseDto { ExternalBotId = res.Data.BotId, MeetingId = meetingId };
    }

    private void UpsertEventsFromApi(Guid connectionId, IReadOnlyList<CalendarEventApiData> apiEvents)
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var e in apiEvents)
        {
            if (string.IsNullOrWhiteSpace(e.EventId))
                continue;
            var existing = _events.FindByExternal(connectionId, e.EventId!);
            var id = existing?.Id ?? Guid.NewGuid();
            var startRaw = e.StartTime ?? e.Start;
            var endRaw = e.EndTime ?? e.End;
            var start = Parse(startRaw) ?? existing?.StartUtc ?? now;
            var end = Parse(endRaw) ?? existing?.EndUtc ?? start.AddHours(1);
            var isCancelled = e.IsCancelled == true
                || string.Equals(e.Status, "cancelled", StringComparison.OrdinalIgnoreCase)
                || (string.IsNullOrWhiteSpace(e.Status) && e.IsCancelled is null && (existing?.IsCancelled ?? false));
            var evt = new CalendarEvent
            {
                Id = id,
                CalendarConnectionId = connectionId,
                ExternalEventId = e.EventId!,
                SeriesId = e.SeriesId,
                Title = e.Title ?? existing?.Title ?? "Event",
                StartUtc = start,
                EndUtc = end,
                MeetingUrl = e.MeetingUrl ?? existing?.MeetingUrl,
                IsRecurring = e.IsRecurring ?? existing?.IsRecurring ?? false,
                IsCancelled = isCancelled,
                LinkedMeetingId = existing?.LinkedMeetingId,
                UpdatedAt = now
            };
            _events.Upsert(evt);
        }
    }

    private static DateTimeOffset? Parse(string? iso)
    {
        if (string.IsNullOrWhiteSpace(iso))
            return null;
        return DateTimeOffset.TryParse(iso, out var d) ? d : null;
    }

    private static string? InferPlatform(string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return null;
        var u = url.ToLowerInvariant();
        if (u.Contains("meet.google")) return "google_meet";
        if (u.Contains("teams.microsoft") || u.Contains("teams.live")) return "teams";
        if (u.Contains("zoom.us")) return "zoom";
        return "unknown";
    }

    private static CalendarConnectionDto MapConn(CalendarConnection c) => new()
    {
        Id = c.Id,
        UserId = c.UserId,
        Provider = c.Provider,
        ExternalCalendarId = c.ExternalCalendarId,
        Status = c.Status,
        LastSyncedAt = c.LastSyncedAt,
        AccountEmail = c.AccountEmail
    };

    private static CalendarEventDto MapEv(CalendarEvent e) => new()
    {
        Id = e.Id,
        ExternalEventId = e.ExternalEventId,
        SeriesId = e.SeriesId,
        Title = e.Title,
        StartUtc = e.StartUtc,
        EndUtc = e.EndUtc,
        MeetingUrl = e.MeetingUrl,
        IsRecurring = e.IsRecurring,
        IsCancelled = e.IsCancelled,
        LinkedMeetingId = e.LinkedMeetingId
    };
}
