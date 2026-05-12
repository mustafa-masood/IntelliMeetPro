using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.Services;

public interface IIntegrationTokenService
{
    /// <summary>Ensures Asana/Jira access tokens are refreshed when nearing expiry; Trello is a no-op.</summary>
    Task EnsureValidAccessAsync(ProjectManagementIntegration row, ProjectManagementPlatform platform, CancellationToken ct);
}
