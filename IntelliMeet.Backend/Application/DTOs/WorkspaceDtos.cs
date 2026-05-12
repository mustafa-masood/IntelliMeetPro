using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.DTOs;

public sealed class WorkspaceSummaryDto
{
    public Guid WorkspaceId { get; init; }
    public string Name { get; init; } = string.Empty;
    public WorkspacePlan Plan { get; init; }
    public IReadOnlyList<WorkspaceMemberRowDto> Members { get; init; } = Array.Empty<WorkspaceMemberRowDto>();
}

public sealed class WorkspaceMemberRowDto
{
    public Guid UserId { get; init; }
    public string Email { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public WorkspaceMemberRole Role { get; init; }
    public Guid? TeamId { get; init; }
    public string? TeamName { get; init; }
}

public sealed class WorkspaceInviteRequestDto
{
    public string Email { get; set; } = string.Empty;
    public Guid? TeamId { get; set; }
}

public sealed class WorkspaceChangeRoleRequestDto
{
    public Guid UserId { get; set; }
    public WorkspaceMemberRole Role { get; set; }
}

public sealed class WorkspaceRemoveMemberRequestDto
{
    public Guid UserId { get; set; }
}

public sealed class TeamRowDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
}

public sealed class CreateTeamRequestDto
{
    public string Name { get; set; } = string.Empty;
}

public sealed class AssignMemberTeamRequestDto
{
    public Guid UserId { get; set; }
    public Guid? TeamId { get; set; }
}
