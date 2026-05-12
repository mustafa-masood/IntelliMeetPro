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

    /// <summary>When <c>ollama</c>, item was produced by transcript analysis and can be replaced on re-run.</summary>
    public string? Source { get; set; }

    /// <summary>Last external task/issue/card link after a successful push.</summary>
    public string? ExternalTaskUrl { get; set; }

    /// <summary>Platform last synced to, if any.</summary>
    public ProjectManagementPlatform? SyncedPlatform { get; set; }

    public Guid? WorkspaceId { get; set; }

    public Guid? AssignedUserId { get; set; }

    public string? SuggestedAssigneeName { get; set; }

    public float? SuggestedAssigneeConfidence { get; set; }
}
