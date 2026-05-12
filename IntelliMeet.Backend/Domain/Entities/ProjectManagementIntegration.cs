using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Domain.Entities;

public sealed class ProjectManagementIntegration
{
    public Guid Id { get; set; }

    public Guid? WorkspaceId { get; set; }

    public Guid UserId { get; set; }
    public ProjectManagementPlatform Platform { get; set; }

    /// <summary>OAuth or API bearer token. // TODO(Mustafa): encrypt at rest.</summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>OAuth refresh token (not used for Trello token auth).</summary>
    public string? RefreshToken { get; set; }

    public DateTimeOffset? ExpiresAtUtc { get; set; }

    /// <summary>Asana project GID or Jira project id.</summary>
    public string? ProjectId { get; set; }

    /// <summary>Trello board id.</summary>
    public string? BoardId { get; set; }

    /// <summary>Jira/Atlassian Cloud id from accessible-resources (required for Jira REST).</summary>
    public string? JiraCloudId { get; set; }

    /// <summary>Human label for the selected project/board shown in the UI.</summary>
    public string? SelectedTargetName { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
}
