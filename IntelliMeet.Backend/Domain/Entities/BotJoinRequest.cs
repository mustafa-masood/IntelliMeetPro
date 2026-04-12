namespace IntelliMeet.Backend.Domain.Entities;

public sealed class BotJoinRequest
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string MeetingUrl { get; set; } = string.Empty;
    public string BotName { get; set; } = string.Empty;
    public DateTimeOffset RequestedAt { get; set; }
    public string? ResultingExternalBotId { get; set; }
    public Guid? ResultingMeetingId { get; set; }
    public string? ErrorMessage { get; set; }
}
