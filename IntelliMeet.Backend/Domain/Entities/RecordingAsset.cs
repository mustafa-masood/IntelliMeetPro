namespace IntelliMeet.Backend.Domain.Entities;

public sealed class RecordingAsset
{
    public Guid Id { get; set; }
    public Guid MeetingId { get; set; }
    public string Kind { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public DateTimeOffset? ExpiresAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
