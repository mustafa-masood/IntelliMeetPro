using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.DTOs;

public sealed class IntegrationConnectionDto
{
    public ProjectManagementPlatform Platform { get; init; }
    public bool Connected { get; init; }
    public string? ProjectId { get; init; }
    public string? BoardId { get; init; }
    /// <summary>Workspace / project / board name when chosen.</summary>
    public string? DisplayName { get; init; }
}

public sealed class IntegrationSetupOptionDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    /// <summary>e.g. project, board, workspace</summary>
    public string Type { get; init; } = string.Empty;
}

public sealed class IntegrationSetupPostDto
{
    public string? ProjectId { get; init; }
    public string? BoardId { get; init; }
}

public sealed class TrelloProcessTokenDto
{
    public string Token { get; init; } = string.Empty;
    public Guid? UserId { get; init; }
}

public sealed class PushActionItemRequestDto
{
    public Guid MeetingId { get; init; }
    public Guid? ActionItemId { get; init; }
    public string? ActionItemText { get; init; }
    public Guid? UserId { get; init; }
}

public sealed class PushActionItemResponseDto
{
    public string? ExternalUrl { get; init; }
    public ProjectManagementPlatform Platform { get; init; }
}
