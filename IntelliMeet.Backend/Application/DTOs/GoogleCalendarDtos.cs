namespace IntelliMeet.Backend.Application.DTOs;

public sealed class RawCalendarItemDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public bool IsPrimary { get; init; }
}

public sealed class ListRawCalendarsRequestDto
{
    public string RefreshToken { get; set; } = string.Empty;
}
