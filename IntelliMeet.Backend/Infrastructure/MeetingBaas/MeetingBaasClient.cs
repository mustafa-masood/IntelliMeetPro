using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.Integration;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Infrastructure.MeetingBaas;

public sealed class MeetingBaasClient : IMeetingBaasClient
{
    private readonly HttpClient _http;
    private readonly ILogger<MeetingBaasClient> _logger;
    private readonly MeetingBaasOptions _options;

    public MeetingBaasClient(HttpClient http, IOptions<MeetingBaasOptions> options, ILogger<MeetingBaasClient> logger)
    {
        _http = http;
        _logger = logger;
        _options = options.Value;
        var baseUrl = _options.BaseUrl.TrimEnd('/');
        _http.BaseAddress = new Uri(baseUrl + "/");
        _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        if (!string.IsNullOrWhiteSpace(_options.ApiKey))
            _http.DefaultRequestHeaders.TryAddWithoutValidation("x-meeting-baas-api-key", _options.ApiKey);
        else
            _logger.LogWarning("MeetingBaas:ApiKey is empty — outbound API calls will fail until configured.");
    }

    public Task<MeetingBaasResult<CreateBotResponseData>> CreateBotAsync(CreateBotRequest body, CancellationToken ct) =>
        PostAsync<CreateBotRequest, CreateBotResponseData>("v2/bots", body, ct);

    public Task<MeetingBaasResult<CreateBotResponseData>> CreateScheduledBotAsync(ScheduledBotRequest body, CancellationToken ct) =>
        PostAsync<ScheduledBotRequest, CreateBotResponseData>("v2/bots/scheduled", body, ct);

    public Task<MeetingBaasResult<BotDetailsData>> GetBotAsync(string botId, CancellationToken ct) =>
        GetAsync<BotDetailsData>($"v2/bots/{Uri.EscapeDataString(botId)}", ct);

    public async Task<MeetingBaasResult<BotsListPageResult>> ListBotsAsync(ListBotsQuery query, CancellationToken ct)
    {
        var limit = Math.Clamp(query.Limit, 1, 250);
        var qs = new List<string> { "limit=" + limit.ToString(CultureInfo.InvariantCulture) };
        if (!string.IsNullOrEmpty(query.Cursor))
            qs.Add("cursor=" + Uri.EscapeDataString(query.Cursor));
        if (!string.IsNullOrWhiteSpace(query.MeetingUrl))
            qs.Add("meeting_url=" + Uri.EscapeDataString(query.MeetingUrl));
        if (!string.IsNullOrWhiteSpace(query.BotId))
            qs.Add("bot_id=" + Uri.EscapeDataString(query.BotId));
        if (!string.IsNullOrWhiteSpace(query.Status))
            qs.Add("status=" + Uri.EscapeDataString(query.Status));
        if (!string.IsNullOrWhiteSpace(query.MeetingPlatform))
            qs.Add("meeting_platform=" + Uri.EscapeDataString(query.MeetingPlatform));
        if (!string.IsNullOrWhiteSpace(query.CreatedAfter))
            qs.Add("created_after=" + Uri.EscapeDataString(query.CreatedAfter));
        if (!string.IsNullOrWhiteSpace(query.CreatedBefore))
            qs.Add("created_before=" + Uri.EscapeDataString(query.CreatedBefore));
        var path = "v2/bots?" + string.Join('&', qs);
        return await ParseBotsListPageAsync(path, ct).ConfigureAwait(false);
    }

    public async Task<MeetingBaasResult<ScheduledBotsListPageResult>> ListScheduledBotsAsync(ListScheduledBotsQuery query, CancellationToken ct)
    {
        var limit = Math.Clamp(query.Limit, 1, 100);
        var qs = new List<string> { "limit=" + limit.ToString(CultureInfo.InvariantCulture) };
        if (!string.IsNullOrEmpty(query.Cursor))
            qs.Add("cursor=" + Uri.EscapeDataString(query.Cursor));
        if (!string.IsNullOrWhiteSpace(query.MeetingUrl))
            qs.Add("meeting_url=" + Uri.EscapeDataString(query.MeetingUrl));
        if (!string.IsNullOrWhiteSpace(query.BotId))
            qs.Add("bot_id=" + Uri.EscapeDataString(query.BotId));
        if (!string.IsNullOrWhiteSpace(query.Status))
            qs.Add("status=" + Uri.EscapeDataString(query.Status));
        if (!string.IsNullOrWhiteSpace(query.MeetingPlatform))
            qs.Add("meeting_platform=" + Uri.EscapeDataString(query.MeetingPlatform));
        if (!string.IsNullOrWhiteSpace(query.ScheduledAfter))
            qs.Add("scheduled_after=" + Uri.EscapeDataString(query.ScheduledAfter));
        if (!string.IsNullOrWhiteSpace(query.ScheduledBefore))
            qs.Add("scheduled_before=" + Uri.EscapeDataString(query.ScheduledBefore));
        var path = "v2/bots/scheduled?" + string.Join('&', qs);
        return await ParseScheduledBotsListPageAsync(path, ct).ConfigureAwait(false);
    }

    public Task<MeetingBaasResult<ScheduledBotDetailsData>> GetScheduledBotDetailsAsync(string scheduledBotId, CancellationToken ct) =>
        GetAsync<ScheduledBotDetailsData>($"v2/bots/scheduled/{Uri.EscapeDataString(scheduledBotId)}", ct);

    public Task<MeetingBaasResult<BotStatusData>> GetBotStatusAsync(string botId, CancellationToken ct) =>
        GetAsync<BotStatusData>($"v2/bots/{Uri.EscapeDataString(botId)}/status", ct);

    public Task<MeetingBaasResult<MessageData>> LeaveBotAsync(string botId, CancellationToken ct) =>
        PostEmptyAsync<MessageData>($"v2/bots/{Uri.EscapeDataString(botId)}/leave", ct);

    public Task<MeetingBaasResult<DeleteBotDataResponse>> DeleteBotDataAsync(string botId, CancellationToken ct) =>
        DeleteAsync<DeleteBotDataResponse>($"v2/bots/{Uri.EscapeDataString(botId)}/delete-data", ct);

    public Task<MeetingBaasResult<object>> CancelScheduledBotAsync(string scheduledBotId, CancellationToken ct) =>
        DeleteAsync<object>($"v2/bots/scheduled/{Uri.EscapeDataString(scheduledBotId)}", ct);

    public async Task<MeetingBaasResult<IReadOnlyList<RawCalendarListItemData>>> ListRawCalendarsAsync(ListRawCalendarsRequest body, CancellationToken ct)
    {
        var json = JsonSerializer.Serialize(body, MeetingBaasJson.Options);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        using var resp = await _http.PostAsync("v2/calendars/list-raw", content, ct).ConfigureAwait(false);
        var responseBody = await resp.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        if (!resp.IsSuccessStatusCode)
            return new MeetingBaasResult<IReadOnlyList<RawCalendarListItemData>>(false, null, (int)resp.StatusCode, responseBody, responseBody);
        try
        {
            using var doc = JsonDocument.Parse(responseBody);
            if (!doc.RootElement.TryGetProperty("data", out var data) || data.ValueKind != JsonValueKind.Array)
                return new MeetingBaasResult<IReadOnlyList<RawCalendarListItemData>>(true, Array.Empty<RawCalendarListItemData>(), (int)resp.StatusCode, null, responseBody);
            var list = JsonSerializer.Deserialize<List<RawCalendarListItemData>>(data.GetRawText(), MeetingBaasJson.Options) ?? new();
            return new MeetingBaasResult<IReadOnlyList<RawCalendarListItemData>>(true, list, (int)resp.StatusCode, null, responseBody);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "list-raw parse failed");
            return new MeetingBaasResult<IReadOnlyList<RawCalendarListItemData>>(false, null, (int)resp.StatusCode, ex.Message, responseBody);
        }
    }

    public Task<MeetingBaasResult<CalendarCreatedData>> CreateCalendarConnectionAsync(CreateCalendarRequest body, CancellationToken ct) =>
        PostAsync<CreateCalendarRequest, CalendarCreatedData>("v2/calendars", body, ct);

    public async Task<MeetingBaasResult<IReadOnlyList<CalendarListItemData>>> ListCalendarsAsync(CancellationToken ct)
    {
        var raw = await GetRawAsync("v2/calendars", ct).ConfigureAwait(false);
        if (!raw.Success)
            return new MeetingBaasResult<IReadOnlyList<CalendarListItemData>>(false, null, raw.StatusCode, raw.ErrorMessage, raw.RawBody);
        try
        {
            using var doc = JsonDocument.Parse(raw.RawBody ?? "{}");
            if (!doc.RootElement.TryGetProperty("data", out var data))
                return new MeetingBaasResult<IReadOnlyList<CalendarListItemData>>(true, Array.Empty<CalendarListItemData>(), raw.StatusCode, null, raw.RawBody);
            if (data.ValueKind == JsonValueKind.Array)
            {
                var list = JsonSerializer.Deserialize<List<CalendarListItemData>>(data.GetRawText(), MeetingBaasJson.Options)
                           ?? new List<CalendarListItemData>();
                return new MeetingBaasResult<IReadOnlyList<CalendarListItemData>>(true, list, raw.StatusCode, null, raw.RawBody);
            }
            var single = JsonSerializer.Deserialize<CalendarListItemData>(data.GetRawText(), MeetingBaasJson.Options);
            return new MeetingBaasResult<IReadOnlyList<CalendarListItemData>>(true, single is null ? Array.Empty<CalendarListItemData>() : new[] { single }, raw.StatusCode, null, raw.RawBody);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse calendar list response");
            return new MeetingBaasResult<IReadOnlyList<CalendarListItemData>>(false, null, raw.StatusCode, ex.Message, raw.RawBody);
        }
    }

    public Task<MeetingBaasResult<CalendarDetailData>> GetCalendarAsync(string calendarId, CancellationToken ct) =>
        GetAsync<CalendarDetailData>($"v2/calendars/{Uri.EscapeDataString(calendarId)}", ct);

    public Task<MeetingBaasResult<object>> SyncCalendarAsync(string calendarId, CancellationToken ct) =>
        PostEmptyAsync<object>($"v2/calendars/{Uri.EscapeDataString(calendarId)}/sync", ct);

    public async Task<MeetingBaasResult<CalendarEventsPageData>> GetCalendarEventsAsync(string calendarId, CancellationToken ct)
    {
        var allEvents = new List<CalendarEventApiData>();
        string? cursor = null;
        string? lastBody = null;
        int? lastCode = null;
        for (var page = 0; page < 50; page++)
        {
            var path = $"v2/calendars/{Uri.EscapeDataString(calendarId)}/events?limit=250&show_cancelled=true";
            if (!string.IsNullOrEmpty(cursor))
                path += "&cursor=" + Uri.EscapeDataString(cursor);
            var raw = await GetRawAsync(path, ct).ConfigureAwait(false);
            lastBody = raw.RawBody;
            lastCode = raw.StatusCode;
            if (!raw.Success)
                return new MeetingBaasResult<CalendarEventsPageData>(false, null, raw.StatusCode, raw.ErrorMessage, raw.RawBody);
            try
            {
                using var doc = JsonDocument.Parse(raw.RawBody ?? "{}");
                if (!doc.RootElement.TryGetProperty("data", out var data))
                    break;
                List<CalendarEventApiData> batch;
                if (data.ValueKind == JsonValueKind.Array)
                    batch = JsonSerializer.Deserialize<List<CalendarEventApiData>>(data.GetRawText(), MeetingBaasJson.Options) ?? new();
                else if (data.TryGetProperty("events", out var ev) && ev.ValueKind == JsonValueKind.Array)
                    batch = JsonSerializer.Deserialize<List<CalendarEventApiData>>(ev.GetRawText(), MeetingBaasJson.Options) ?? new();
                else
                    batch = new List<CalendarEventApiData>();
                allEvents.AddRange(batch);
                string? next = null;
                if (doc.RootElement.TryGetProperty("cursor", out var c) && c.ValueKind == JsonValueKind.String)
                    next = c.GetString();
                if (string.IsNullOrEmpty(next) || batch.Count == 0)
                    break;
                cursor = next;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse calendar events page");
                return new MeetingBaasResult<CalendarEventsPageData>(false, null, lastCode, ex.Message, lastBody);
            }
        }
        return new MeetingBaasResult<CalendarEventsPageData>(true, new CalendarEventsPageData { Events = allEvents }, lastCode, null, lastBody);
    }

    public Task<MeetingBaasResult<ScheduleCalendarBotData>> ScheduleBotForEventAsync(string calendarId, ScheduleCalendarBotRequest body, CancellationToken ct) =>
        PostAsync<ScheduleCalendarBotRequest, ScheduleCalendarBotData>($"v2/calendars/{Uri.EscapeDataString(calendarId)}/bots", body, ct);

    private async Task<MeetingBaasResult<TData>> GetAsync<TData>(string relative, CancellationToken ct) where TData : class
    {
        using var resp = await _http.GetAsync(relative, ct).ConfigureAwait(false);
        var body = await resp.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        return DeserializeEnvelope<TData>(resp, body);
    }

    private async Task<MeetingBaasRawResult> GetRawAsync(string relative, CancellationToken ct)
    {
        using var resp = await _http.GetAsync(relative, ct).ConfigureAwait(false);
        var body = await resp.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        return new MeetingBaasRawResult(resp.IsSuccessStatusCode, (int)resp.StatusCode,
            resp.IsSuccessStatusCode ? null : body, body);
    }

    private async Task<MeetingBaasResult<TData>> PostAsync<TReq, TData>(string relative, TReq payload, CancellationToken ct) where TData : class
    {
        var json = JsonSerializer.Serialize(payload, MeetingBaasJson.Options);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        using var resp = await _http.PostAsync(relative, content, ct).ConfigureAwait(false);
        var body = await resp.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        return DeserializeEnvelope<TData>(resp, body);
    }

    private async Task<MeetingBaasResult<TData>> PostEmptyAsync<TData>(string relative, CancellationToken ct) where TData : class
    {
        using var content = new StringContent("{}", Encoding.UTF8, "application/json");
        using var resp = await _http.PostAsync(relative, content, ct).ConfigureAwait(false);
        var body = await resp.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        return DeserializeEnvelope<TData>(resp, body);
    }

    private async Task<MeetingBaasResult<TData>> DeleteAsync<TData>(string relative, CancellationToken ct) where TData : class
    {
        using var resp = await _http.DeleteAsync(relative, ct).ConfigureAwait(false);
        var body = await resp.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        return DeserializeEnvelope<TData>(resp, body);
    }

    private MeetingBaasResult<TData> DeserializeEnvelope<TData>(HttpResponseMessage resp, string body) where TData : class
    {
        try
        {
            var envelope = JsonSerializer.Deserialize<MbEnvelope<TData>>(body, MeetingBaasJson.Options);
            if (envelope?.Success == true && envelope.Data is not null)
                return new MeetingBaasResult<TData>(true, envelope.Data, (int)resp.StatusCode, null, body);
            if (resp.IsSuccessStatusCode && envelope?.Data is not null)
                return new MeetingBaasResult<TData>(true, envelope.Data, (int)resp.StatusCode, null, body);
            var err = envelope?.Error ?? envelope?.Message ?? body;
            return new MeetingBaasResult<TData>(false, null, (int)resp.StatusCode, err, body);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Meeting BaaS JSON parse failed");
            return new MeetingBaasResult<TData>(false, null, (int)resp.StatusCode, ex.Message, body);
        }
    }

    private async Task<MeetingBaasResult<BotsListPageResult>> ParseBotsListPageAsync(string relative, CancellationToken ct)
    {
        using var resp = await _http.GetAsync(relative, ct).ConfigureAwait(false);
        var body = await resp.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        if (!resp.IsSuccessStatusCode)
            return new MeetingBaasResult<BotsListPageResult>(false, null, (int)resp.StatusCode, body, body);
        try
        {
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;
            if (root.TryGetProperty("success", out var ok) && ok.ValueKind == JsonValueKind.False)
            {
                var err = root.TryGetProperty("error", out var e) ? e.GetString() : body;
                return new MeetingBaasResult<BotsListPageResult>(false, null, (int)resp.StatusCode, err, body);
            }

            List<BotListItemData> items = new();
            if (root.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Array)
                items = JsonSerializer.Deserialize<List<BotListItemData>>(data.GetRawText(), MeetingBaasJson.Options) ?? new();
            string? cursor = null;
            if (root.TryGetProperty("cursor", out var c) && c.ValueKind == JsonValueKind.String)
                cursor = c.GetString();
            string? prev = null;
            if (root.TryGetProperty("prev_cursor", out var p) && p.ValueKind == JsonValueKind.String)
                prev = p.GetString();
            var page = new BotsListPageResult { Items = items, NextCursor = cursor, PrevCursor = prev };
            return new MeetingBaasResult<BotsListPageResult>(true, page, (int)resp.StatusCode, null, body);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "list bots parse failed");
            return new MeetingBaasResult<BotsListPageResult>(false, null, (int)resp.StatusCode, ex.Message, body);
        }
    }

    private async Task<MeetingBaasResult<ScheduledBotsListPageResult>> ParseScheduledBotsListPageAsync(string relative, CancellationToken ct)
    {
        using var resp = await _http.GetAsync(relative, ct).ConfigureAwait(false);
        var body = await resp.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        if (!resp.IsSuccessStatusCode)
            return new MeetingBaasResult<ScheduledBotsListPageResult>(false, null, (int)resp.StatusCode, body, body);
        try
        {
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;
            if (root.TryGetProperty("success", out var ok) && ok.ValueKind == JsonValueKind.False)
            {
                var err = root.TryGetProperty("error", out var e) ? e.GetString() : body;
                return new MeetingBaasResult<ScheduledBotsListPageResult>(false, null, (int)resp.StatusCode, err, body);
            }

            List<ScheduledBotListItemData> items = new();
            if (root.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Array)
                items = JsonSerializer.Deserialize<List<ScheduledBotListItemData>>(data.GetRawText(), MeetingBaasJson.Options) ?? new();
            string? cursor = null;
            if (root.TryGetProperty("cursor", out var c) && c.ValueKind == JsonValueKind.String)
                cursor = c.GetString();
            string? prev = null;
            if (root.TryGetProperty("prev_cursor", out var p) && p.ValueKind == JsonValueKind.String)
                prev = p.GetString();
            var page = new ScheduledBotsListPageResult { Items = items, NextCursor = cursor, PrevCursor = prev };
            return new MeetingBaasResult<ScheduledBotsListPageResult>(true, page, (int)resp.StatusCode, null, body);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "list scheduled bots parse failed");
            return new MeetingBaasResult<ScheduledBotsListPageResult>(false, null, (int)resp.StatusCode, ex.Message, body);
        }
    }

    private sealed record MeetingBaasRawResult(bool Success, int? StatusCode, string? ErrorMessage, string? RawBody);
}
