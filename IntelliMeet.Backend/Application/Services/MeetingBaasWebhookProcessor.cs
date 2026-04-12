using System.Text.Json;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.Services;

public sealed class MeetingBaasWebhookProcessor : IMeetingBaasWebhookProcessor
{
    private readonly IWebhookEventRepository _webhooks;
    private readonly IMeetingBotRepository _bots;
    private readonly IMeetingRepository _meetings;
    private readonly ITranscriptRepository _transcripts;
    private readonly IRecordingAssetRepository _recordings;
    private readonly ICalendarConnectionRepository _calendars;
    private readonly ICalendarEventRepository _events;
    private readonly IMeetingBaasClient _mb;
    private readonly ILogger<MeetingBaasWebhookProcessor> _logger;

    public MeetingBaasWebhookProcessor(
        IWebhookEventRepository webhooks,
        IMeetingBotRepository bots,
        IMeetingRepository meetings,
        ITranscriptRepository transcripts,
        IRecordingAssetRepository recordings,
        ICalendarConnectionRepository calendars,
        ICalendarEventRepository events,
        IMeetingBaasClient mb,
        ILogger<MeetingBaasWebhookProcessor> logger)
    {
        _webhooks = webhooks;
        _bots = bots;
        _meetings = meetings;
        _transcripts = transcripts;
        _recordings = recordings;
        _calendars = calendars;
        _events = events;
        _mb = mb;
        _logger = logger;
    }

    public async Task<WebhookAcceptResult> ProcessAsync(string rawPayload, string? svixId, CancellationToken ct)
    {
        var type = WebhookEventParser.ParseType(rawPayload);
        var evt = new WebhookEvent
        {
            Id = Guid.NewGuid(),
            EventType = type,
            RawPayload = rawPayload,
            ExternalMessageId = svixId,
            Processed = false,
            ReceivedAt = DateTimeOffset.UtcNow
        };
        try
        {
            await ApplyDomainUpdatesAsync(type, rawPayload, ct).ConfigureAwait(false);
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

    private async Task ApplyDomainUpdatesAsync(WebhookEventType type, string raw, CancellationToken ct)
    {
        var botId = WebhookEventParser.TryGetBotId(raw);
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
            bot.Status = BotStatusMapper.FromMeetingBaas(st.Data.Status);
            bot.TranscriptionStatus = BotStatusMapper.TranscriptionFromMeetingBaas(st.Data.TranscriptionStatus);
            bot.UpdatedAt = DateTimeOffset.UtcNow;
            _bots.Upsert(bot);
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
        if (meeting is not null)
        {
            meeting.Status = MeetingStatus.Completed;
            meeting.UpdatedAt = DateTimeOffset.UtcNow;
            _meetings.Upsert(meeting);
        }
        bot.Status = BotOperationalStatus.Completed;
        bot.TranscriptionStatus = TranscriptStatus.Ready;
        bot.UpdatedAt = DateTimeOffset.UtcNow;
        _bots.Upsert(bot);
        if (details.Success && details.Data is not null)
            ApplyArtifacts(bot.MeetingId, details.Data);
        TryApplyArtifactsFromWebhookJson(bot.MeetingId, raw);
    }

    private void FailBot(string externalBotId, string raw)
    {
        var bot = _bots.GetByExternalBotId(externalBotId);
        if (bot is null)
            return;
        bot.Status = BotOperationalStatus.Failed;
        bot.UpdatedAt = DateTimeOffset.UtcNow;
        _bots.Upsert(bot);
        var m = _meetings.GetById(bot.MeetingId);
        if (m is not null)
        {
            m.Status = MeetingStatus.Failed;
            m.UpdatedAt = DateTimeOffset.UtcNow;
            _meetings.Upsert(m);
        }
        _logger.LogWarning("Bot failed: {Id} payload snippet {Snippet}", externalBotId, raw[..Math.Min(200, raw.Length)]);
    }

    private async Task MarkTranscriptionReadyAsync(string externalBotId, string raw, CancellationToken ct)
    {
        var bot = _bots.GetByExternalBotId(externalBotId);
        if (bot is null)
            return;
        bot.TranscriptionStatus = TranscriptStatus.Ready;
        bot.UpdatedAt = DateTimeOffset.UtcNow;
        _bots.Upsert(bot);
        TryApplyArtifactsFromWebhookJson(bot.MeetingId, raw);
        var details = await _mb.GetBotAsync(externalBotId, ct).ConfigureAwait(false);
        if (details.Success && details.Data is not null)
            ApplyArtifacts(bot.MeetingId, details.Data);
    }

    private void ApplyArtifacts(Guid meetingId, Application.Integration.BotDetailsData d)
    {
        var now = DateTimeOffset.UtcNow;
        var exp = now.AddHours(3);
        void Add(string kind, string? url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return;
            _recordings.Upsert(new RecordingAsset
            {
                Id = Guid.NewGuid(),
                MeetingId = meetingId,
                Kind = kind,
                Url = url!,
                ExpiresAt = exp,
                CreatedAt = now
            });
        }
        Add("audio", d.Audio);
        Add("video", d.Video);
        var t = _transcripts.GetByMeetingId(meetingId);
        if (t is null)
        {
            t = new Transcript
            {
                Id = Guid.NewGuid(),
                MeetingId = meetingId,
                Status = TranscriptStatus.Ready,
                RawText = null,
                ExternalTranscriptionUrl = d.Transcription,
                ExternalRawTranscriptionUrl = d.Diarization,
                UpdatedAt = now
            };
            _transcripts.Upsert(t);
        }
        else
        {
            t.Status = TranscriptStatus.Ready;
            t.ExternalTranscriptionUrl ??= d.Transcription;
            t.ExternalRawTranscriptionUrl ??= d.Diarization;
            t.UpdatedAt = now;
            _transcripts.Upsert(t);
        }
    }

    private void TryApplyArtifactsFromWebhookJson(Guid meetingId, string raw)
    {
        try
        {
            using var doc = JsonDocument.Parse(raw);
            if (!doc.RootElement.TryGetProperty("data", out var data))
                return;
            string? audio = null, trans = null, rawT = null;
            if (data.TryGetProperty("audio", out var a))
                audio = a.GetString();
            if (data.TryGetProperty("transcription", out var tr))
                trans = tr.GetString();
            if (data.TryGetProperty("raw_transcription", out var rt))
                rawT = rt.GetString();
            var fake = new Application.Integration.BotDetailsData { Audio = audio, Transcription = trans, Diarization = rawT };
            ApplyArtifacts(meetingId, fake);
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
