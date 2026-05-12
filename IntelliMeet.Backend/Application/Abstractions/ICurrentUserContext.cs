using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.Abstractions;

/// <summary>Per-request resolved user + workspace (Clerk JWT or legacy header).</summary>
public interface ICurrentUserContext
{
    Guid UserId { get; }
    Guid WorkspaceId { get; }
    Guid? TeamId { get; }
    WorkspaceMemberRole Role { get; }
    bool IsResolved { get; }
}
