using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using IntelliMeet.Backend.Application.Abstractions;

namespace IntelliMeet.Backend.Infrastructure.GoogleCalendar;

public sealed class GoogleCalendarClient : IGoogleCalendarClient
{
    private readonly HttpClient _http;

    public GoogleCalendarClient(HttpClient http)
    {
        _http = http;
    }

    public async Task<GoogleCreateEventResult> CreateEventWithConferenceAsync(
        string accessToken,
        GoogleCreateEventRequest request,
        CancellationToken ct)
    {
        var body = new
        {
            summary = request.Title,
            start = new { dateTime = request.StartUtc.ToUniversalTime().ToString("o"), timeZone = "UTC" },
            end = new { dateTime = request.EndUtc.ToUniversalTime().ToString("o"), timeZone = "UTC" },
            attendees = request.Attendees
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x => new { email = x.Trim() })
                .ToArray(),
            conferenceData = new
            {
                createRequest = new
                {
                    requestId = Guid.NewGuid().ToString("N"),
                    conferenceSolutionKey = new { type = "hangoutsMeet" }
                }
            }
        };

        using var req = new HttpRequestMessage(
            HttpMethod.Post,
            "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1")
        {
            Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
        };
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        using var res = await _http.SendAsync(req, ct).ConfigureAwait(false);
        var raw = await res.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        if (!res.IsSuccessStatusCode)
            throw new InvalidOperationException($"Google Calendar create event failed: {(int)res.StatusCode} {raw}");

        using var doc = JsonDocument.Parse(raw);
        var root = doc.RootElement;
        var eventId = root.TryGetProperty("id", out var idEl) ? idEl.GetString() : null;
        var html = root.TryGetProperty("htmlLink", out var htmlEl) ? htmlEl.GetString() : null;

        string? meetingUrl = null;
        if (root.TryGetProperty("hangoutLink", out var hEl))
            meetingUrl = hEl.GetString();
        if (string.IsNullOrWhiteSpace(meetingUrl) &&
            root.TryGetProperty("conferenceData", out var cd) &&
            cd.TryGetProperty("entryPoints", out var eps) &&
            eps.ValueKind == JsonValueKind.Array)
        {
            foreach (var ep in eps.EnumerateArray())
            {
                var entryType = ep.TryGetProperty("entryPointType", out var t) ? t.GetString() : null;
                if (string.Equals(entryType, "video", StringComparison.OrdinalIgnoreCase))
                {
                    meetingUrl = ep.TryGetProperty("uri", out var u) ? u.GetString() : null;
                    if (!string.IsNullOrWhiteSpace(meetingUrl))
                        break;
                }
            }
        }

        if (string.IsNullOrWhiteSpace(eventId))
            throw new InvalidOperationException("Google Calendar did not return event id.");

        return new GoogleCreateEventResult
        {
            EventId = eventId!,
            HtmlLink = html,
            MeetingUrl = meetingUrl
        };
    }
}
