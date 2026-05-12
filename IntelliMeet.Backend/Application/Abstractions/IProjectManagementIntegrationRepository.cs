using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IProjectManagementIntegrationRepository
{
    ProjectManagementIntegration? GetByUserAndPlatform(Guid userId, ProjectManagementPlatform platform);
    /// <summary>Tracked row for updates (includes token refresh).</summary>
    ProjectManagementIntegration? GetTrackedByUserAndPlatform(Guid userId, ProjectManagementPlatform platform);
    void Upsert(ProjectManagementIntegration integration);
    void DeleteByUserAndPlatform(Guid userId, ProjectManagementPlatform platform);
}
