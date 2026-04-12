using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Domain.Entities;

public sealed class ActionItem
{
    public Guid Id { get; set; }
    public Guid MeetingId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Owner { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public ActionItemPriority Priority { get; set; }
    public string Status { get; set; } = "open";
    public bool AddToTodoChecked { get; set; }
    public Guid? LinkedTodoItemId { get; set; }

    /// <summary>When <c>groq</c>, item was produced by Groq analysis and can be replaced on re-run.</summary>
    public string? Source { get; set; }
}
