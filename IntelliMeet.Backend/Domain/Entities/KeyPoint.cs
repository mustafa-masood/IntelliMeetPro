namespace IntelliMeet.Backend.Domain.Entities;

public sealed class KeyPoint
{
    public Guid Id { get; set; }
    public Guid MeetingId { get; set; }
    public int Order { get; set; }
    public string Text { get; set; } = string.Empty;
}
