using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Domain.Entities;

public sealed class WorkspaceMember
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid UserId { get; set; }
    /// <summary>Enterprise-only: member's assigned team within the workspace.</summary>
    public Guid? TeamId { get; set; }
    public WorkspaceMemberRole Role { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
}
