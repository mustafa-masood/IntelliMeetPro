namespace IntelliMeet.Backend.Application.Abstractions;

public interface IGoogleCalendarClient
{
    Task<GoogleCreateEventResult> CreateEventWithConferenceAsync(
        string accessToken,
        GoogleCreateEventRequest request,
        CancellationToken ct);
}

public sealed class GoogleCreateEventRequest
{
    public string Title { get; init; } = string.Empty;
    public DateTimeOffset StartUtc { get; init; }
    public DateTimeOffset EndUtc { get; init; }
    public IReadOnlyList<string> Attendees { get; init; } = Array.Empty<string>();
}

public sealed class GoogleCreateEventResult
{
    public string EventId { get; init; } = string.Empty;
    public string? HtmlLink { get; init; }
    public string? MeetingUrl { get; init; }
}
