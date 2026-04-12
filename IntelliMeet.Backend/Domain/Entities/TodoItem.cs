using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Domain.Entities;

public sealed class TodoItem
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Type { get; set; } = "action_item";
    public DateTimeOffset? DueDate { get; set; }
    public TodoStatus Status { get; set; }
    public Guid? SourceMeetingId { get; set; }
    public Guid? SourceActionItemId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
