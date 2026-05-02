namespace IntelliMeet.Backend.Application.Utilities;

public static class DateTimeUtils
{
    /// <summary>Parses an ISO 8601 string to <see cref="DateTimeOffset"/>. Returns null for null/empty/unparseable input.</summary>
    public static DateTimeOffset? TryParseIso(string? iso) =>
        string.IsNullOrWhiteSpace(iso) ? null
        : DateTimeOffset.TryParse(iso, out var result) ? result
        : null;
}
