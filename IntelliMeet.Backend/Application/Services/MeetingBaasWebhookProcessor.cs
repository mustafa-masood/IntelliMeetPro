using System.Text.Json;
using System.Security.Cryptography;
using System.Text;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Application.Services;

public sealed class MeetingBaasWebhookProcessor : IMeetingBaasWebhookProcessor
{
    private readonly IWebhookEventRepository _webhooks;
    private readonly IMeetingBotRepository _bots;
    private readonly IMeetingRepository _meetings;
    private readonly ICalendarConnectionRepository _calendars;
    private readonly ICalendarEventRepository _events;
    private readonly IMeetingBaasClient _mb;
    private readonly IMeetingBaasArtifactApplier _artifacts;
    private readonly ITranscriptAnalysisBackgroundTrigger _analysisTrigger;
    private readonly IMeetingFlowCoordinationStore _flowCoordination;
    private readonly ReliabilityOptions _reliability;
    private readonly ILogger<MeetingBaasWebhookProcessor> _logger;

    public MeetingBaasWebhookProcessor(
        IWebhookEventRepository webhooks,
        IMeetingBotRepository bots,
        IMeetingRepository meetings,
        ICalendarConnectionRepository calendars,
        ICalendarEventRepository events,
        IMeetingBaasClient mb,
        IMeetingBaasArtifactApplier artifacts,
        ITranscriptAnalysisBackgroundTrigger analysisTrigger,
        IMeetingFlowCoordinationStore flowCoordination,
        IOptions<ReliabilityOptions> reliability,
        ILogger<MeetingBaasWebhookProcessor> logger)
    {
        _webhooks = webhooks;
        _bots = bots;
        _meetings = meetings;
        _calendars = calendars;
        _events = events;
        _mb = mb;
        _artifacts = artifacts;
        _analysisTrigger = analysisTrigger;
        _flowCoordination = flowCoordination;
        _reliability = reliability.Value;
        _logger = logger;
    }

    public async Task<WebhookAcceptResult> ProcessAsync(string rawPayload, string? svixId, CancellationToken ct)
    {
        var type = WebhookEventParser.ParseType(rawPayload);
        var botId = WebhookEventParser.TryGetBotId(rawPayload);
        var dedupeKey = BuildDedupeKey(type, svixId, botId, rawPayload);
        var now = DateTimeOffset.UtcNow;
        var duplicate = !_flowCoordination.TryBeginWebhookEvent(
            dedupeKey,
            now,
            TimeSpan.FromSeconds(Math.Clamp(_reliability.WebhookDeduplicationWindowSeconds, 5, 3600)));

        var evt = new WebhookEvent
        {
            Id = Guid.NewGuid(),
            EventType = type,
            RawPayload = rawPayload,
            ExternalMessageId = svixId,
            Processed = false,
            ReceivedAt = now
        };
        _logger.LogInformation(
            "Webhook received svixId={SvixId} type={Type} botId={BotId} duplicate={Duplicate}",
            svixId,
            type,
            botId,
            duplicate);

        if (duplicate)
        {
            evt.Processed = true;
            evt.ProcessingNote = $"duplicate:{dedupeKey}";
            _webhooks.Add(evt);
            return new WebhookAcceptResult(true, null);
        }

        try
        {
            await ApplyDomainUpdatesAsync(type, rawPayload, botId, ct).ConfigureAwait(false);
            evt.Processed = true;
            evt.ProcessingNote = "ok";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Webhook processing error");
            evt.ProcessingNote = ex.Message;
        }
        _webhooks.Add(evt);
        return new WebhookAcceptResult(true, null);
    }

    private async Task ApplyDomainUpdatesAsync(WebhookEventType type, string raw, string? botId, CancellationToken ct)
    {
        switch (type)
        {
            case WebhookEventType.BotStatusChange:
                if (!string.IsNullOrEmpty(botId))
                    await UpdateBotFromStatusAsync(botId, ct).ConfigureAwait(false);
                break;
            case WebhookEventType.BotCompleted:
                if (!string.IsNullOrEmpty(botId))
                    await CompleteBotAsync(botId, raw, ct).ConfigureAwait(false);
                break;
            case WebhookEventType.BotFailed:
                if (!string.IsNullOrEmpty(botId))
                    FailBot(botId, raw);
                break;
            case WebhookEventType.TranscriptionComplete:
                if (!string.IsNullOrEmpty(botId))
                    await MarkTranscriptionReadyAsync(botId, raw, ct).ConfigureAwait(false);
                break;
            case WebhookEventType.CalendarEventCreated:
            case WebhookEventType.CalendarEventUpdated:
            case WebhookEventType.CalendarEventsSynced:
                UpsertCalendarEventFromPayload(raw);
                break;
            case WebhookEventType.CalendarEventCancelled:
                CancelCalendarEventFromPayload(raw);
                break;
            case WebhookEventType.CalendarConnectionUpdated:
            case WebhookEventType.CalendarConnectionError:
                TouchCalendarConnection(raw);
                break;
            default:
                _logger.LogInformation("Webhook type {Type} stored without domain mutation", type);
                break;
        }
    }

    private async Task UpdateBotFromStatusAsync(string externalBotId, CancellationToken ct)
    {
        var bot = _bots.GetByExternalBotId(externalBotId);
        if (bot is null)
            return;
        var st = await _mb.GetBotStatusAsync(externalBotId, ct).ConfigureAwait(false);
        if (st.Success && st.Data is not null)
        {
            var now = DateTimeOffset.UtcNow;
            var meeting = _meetings.GetById(bot.MeetingId);
            var previousBot = bot.Status;
            var previousTx = bot.TranscriptionStatus;
            var previousMeeting = meeting?.Status;
            MeetingDomainStateMachine.ApplyMappedBotStatus(
                bot,
                meeting,
                BotStatusMapper.FromMeetingBaas(st.Data.Status),
                BotStatusMapper.TranscriptionFromMeetingBaas(st.Data.TranscriptionStatus),
                now);
            _bots.Upsert(bot);
            if (meeting is not null)
            {
                _meetings.Upsert(meeting);
                _flowCoordination.MarkWebhookTouch(meeting.Id, now);
            }
            _logger.LogInformation(
                "Webhook transition type=bot.status_change bot={BotId} meeting={MeetingId} bot {PrevBot}->{NewBot} tx {PrevTx}->{NewTx} meeting {PrevMeeting}->{NewMeeting}",
                externalBotId,
                meeting?.Id,
                previousBot,
                bot.Status,
                previousTx,
                bot.TranscriptionStatus,
                previousMeeting,
                meeting?.Status);
        }
    }

    private async Task CompleteBotAsync(string externalBotId, string raw, CancellationToken ct)
    {
        var bot = _bots.GetByExternalBotId(externalBotId);
        if (bot is null)
        {
            _logger.LogWarning("bot.completed for unknown bot {Id}", externalBotId);
            return;
        }
        var details = await _mb.GetBotAsync(externalBotId, ct).ConfigureAwait(false);
        var meeting = _meetings.GetById(bot.MeetingId);
        var previousBot = bot.Status;
        var previousTx = bot.TranscriptionStatus;
        var previousMeeting = meeting?.Status;
        var now = DateTimeOffset.UtcNow;
        MeetingDomainStateMachine.MarkBotCompleted(bot, meeting, now);
        _bots.Upsert(bot);
        if (meeting is not null)
        {
            _meetings.Upsert(meeting);
            _flowCoordination.MarkWebhookTouch(meeting.Id, now);
        }
        _logger.LogInformation(
            "Webhook transition type=bot.completed bot={BotId} meeting={MeetingId} bot {PrevBot}->{NewBot} tx {PrevTx}->{NewTx} meeting {PrevMeeting}->{NewMeeting}",
            externalBotId,
            meeting?.Id,
            previousBot,
            bot.Status,
            previousTx,
            bot.TranscriptionStatus,
            previousMeeting,
            meeting?.Status);
        if (details.Success && details.Data is not null)
            _artifacts.ApplyFromBotDetails(bot.MeetingId, details.Data);
        TryApplyArtifactsFromWebhookJson(bot.MeetingId, raw);
        _analysisTrigger.EnqueueIfEnabled(bot.MeetingId);
    }

    private void FailBot(string externalBotId, string raw)
    {
        var bot = _bots.GetByExternalBotId(externalBotId);
        if (bot is null)
            return;
        var previousBot = bot.Status;
        var now = DateTimeOffset.UtcNow;
        var meeting = _meetings.GetById(bot.MeetingId);
        var previousMeeting = meeting?.Status;
        MeetingDomainStateMachine.MarkBotFailed(bot, meeting, now);
        _bots.Upsert(bot);
        if (meeting is not null)
        {
            _meetings.Upsert(meeting);
            _flowCoordination.MarkWebhookTouch(meeting.Id, now);
        }
        _logger.LogInformation(
            "Webhook transition type=bot.failed bot={BotId} meeting={MeetingId} bot {PrevBot}->{NewBot} meeting {PrevMeeting}->{NewMeeting}",
            externalBotId,
            meeting?.Id,
            previousBot,
            bot.Status,
            previousMeeting,
            meeting?.Status);
        _logger.LogWarning("Bot failed: {Id} payload snippet {Snippet}", externalBotId, raw[..Math.Min(200, raw.Length)]);
    }

    private async Task MarkTranscriptionReadyAsync(string externalBotId, string raw, CancellationToken ct)
    {
        var bot = _bots.GetByExternalBotId(externalBotId);
        if (bot is null)
            return;
        var previousTx = bot.TranscriptionStatus;
        MeetingDomainStateMachine.MarkBotTranscriptionReady(bot, DateTimeOffset.UtcNow);
        _bots.Upsert(bot);
        _logger.LogInformation(
            "Webhook transition type=transcription.complete bot={BotId} tx {PrevTx}->{NewTx}",
            externalBotId,
            previousTx,
            bot.TranscriptionStatus);
        TryApplyArtifactsFromWebhookJson(bot.MeetingId, raw);
        var details = await _mb.GetBotAsync(externalBotId, ct).ConfigureAwait(false);
        if (details.Success && details.Data is not null)
            _artifacts.ApplyFromBotDetails(bot.MeetingId, details.Data);
        _flowCoordination.MarkWebhookTouch(bot.MeetingId, DateTimeOffset.UtcNow);
        _analysisTrigger.EnqueueIfEnabled(bot.MeetingId);
    }

    private static string BuildDedupeKey(WebhookEventType type, string? svixId, string? botId, string rawPayload)
    {
        if (!string.IsNullOrWhiteSpace(svixId))
            return $"svix:{svixId.Trim()}";

        using var sha = SHA256.Create();
        var hash = Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(rawPayload)));
        return $"fallback:{type}:{botId}:{hash}";
    }

    private void TryApplyArtifactsFromWebhookJson(Guid meetingId, string raw)
    {
        try
        {
            using var doc = JsonDocument.Parse(raw);
            if (!doc.RootElement.TryGetProperty("data", out var data))
                return;
            string? audio = null, trans = null, diarization = null, rawT = null, video = null;
            if (data.TryGetProperty("audio", out var a))
                audio = a.GetString();
            if (data.TryGetProperty("transcription", out var tr))
                trans = tr.GetString();
            if (data.TryGetProperty("diarization", out var di))
                diarization = di.GetString();
            if (data.TryGetProperty("raw_transcription", out var rt))
                rawT = rt.GetString();
            if (data.TryGetProperty("mp4", out var mp4))
                video = mp4.GetString();
            if (string.IsNullOrEmpty(video) && data.TryGetProperty("video", out var v))
                video = v.GetString();
            // ApplyArtifacts maps Diarization → ExternalRawTranscriptionUrl; prefer explicit diarization, else raw_transcription.
            var fake = new Application.Integration.BotDetailsData
            {
                Audio = audio,
                Video = video,
                Transcription = trans,
                Diarization = diarization,
                RawTranscription = rawT
            };
            _artifacts.ApplyFromBotDetails(meetingId, fake);
        }
        catch
        {
            /* ignore */
        }
    }

    private void UpsertCalendarEventFromPayload(string raw)
    {
        try
        {
            using var doc = JsonDocument.Parse(raw);
            if (!doc.RootElement.TryGetProperty("data", out var data))
                return;
            var calExtId = ReadString(data, "calendar_id") ?? ReadString(data, "calendarId");
            if (string.IsNullOrEmpty(calExtId))
                return;
            var conn = _calendars.GetByExternalId(calExtId);
            if (conn is null)
                return;
            if (data.TryGetProperty("events", out var arr) && arr.ValueKind == JsonValueKind.Array)
            {
                foreach (var el in arr.EnumerateArray())
                    UpsertOneEvent(conn.Id, el);
            }
            else
                UpsertOneEvent(conn.Id, data);
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Calendar event upsert parse failed");
        }
    }

    private void UpsertOneEvent(Guid connectionId, JsonElement el)
    {
        var extId = ReadString(el, "event_id") ?? ReadString(el, "eventId");
        if (string.IsNullOrEmpty(extId))
            return;
        var now = DateTimeOffset.UtcNow;
        var existing = _events.FindByExternal(connectionId, extId!);
        var id = existing?.Id ?? Guid.NewGuid();
        var start = ParseDate(ReadString(el, "start")) ?? existing?.StartUtc ?? now;
        var end = ParseDate(ReadString(el, "end")) ?? existing?.EndUtc ?? start.AddHours(1);
        var evt = new CalendarEvent
        {
            Id = id,
            CalendarConnectionId = connectionId,
            ExternalEventId = extId!,
            SeriesId = ReadString(el, "series_id") ?? ReadString(el, "seriesId"),
            Title = ReadString(el, "title") ?? existing?.Title ?? "Event",
            StartUtc = start,
            EndUtc = end,
            MeetingUrl = ReadString(el, "meeting_url") ?? ReadString(el, "meetingUrl") ?? existing?.MeetingUrl,
            IsRecurring = ReadBool(el, "is_recurring") ?? existing?.IsRecurring ?? false,
            IsCancelled = ReadBool(el, "is_cancelled") ?? ReadBool(el, "isCancelled") ?? false,
            LinkedMeetingId = existing?.LinkedMeetingId,
            UpdatedAt = now
        };
        _events.Upsert(evt);
    }

    private void CancelCalendarEventFromPayload(string raw)
    {
        try
        {
            using var doc = JsonDocument.Parse(raw);
            if (!doc.RootElement.TryGetProperty("data", out var data))
                return;
            var calExtId = ReadString(data, "calendar_id") ?? ReadString(data, "calendarId");
            var extId = ReadString(data, "event_id") ?? ReadString(data, "eventId");
            if (string.IsNullOrEmpty(calExtId) || string.IsNullOrEmpty(extId))
                return;
            var conn = _calendars.GetByExternalId(calExtId);
            if (conn is null)
                return;
            var existing = _events.FindByExternal(conn.Id, extId!);
            if (existing is null)
                return;
            existing.IsCancelled = true;
            existing.UpdatedAt = DateTimeOffset.UtcNow;
            _events.Upsert(existing);
        }
        catch
        {
            /* ignore */
        }
    }

    private void TouchCalendarConnection(string raw)
    {
        try
        {
            using var doc = JsonDocument.Parse(raw);
            if (!doc.RootElement.TryGetProperty("data", out var data))
                return;
            var calExtId = ReadString(data, "calendar_id") ?? ReadString(data, "calendarId");
            if (string.IsNullOrEmpty(calExtId))
                return;
            var conn = _calendars.GetByExternalId(calExtId);
            if (conn is null)
                return;
            conn.UpdatedAt = DateTimeOffset.UtcNow;
            if (ReadString(data, "status") is { } st)
                conn.Status = st;
            _calendars.Upsert(conn);
        }
        catch
        {
            /* ignore */
        }
    }

    private static string? ReadString(JsonElement el, string name) =>
        el.TryGetProperty(name, out var p) ? p.GetString() : null;

    private static bool? ReadBool(JsonElement el, string name)
    {
        if (!el.TryGetProperty(name, out var p))
            return null;
        return p.ValueKind switch
        {
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            _ => null
        };
    }

    private static DateTimeOffset? ParseDate(string? iso) =>
        string.IsNullOrWhiteSpace(iso) ? null : DateTimeOffset.TryParse(iso, out var d) ? d : null;
}
