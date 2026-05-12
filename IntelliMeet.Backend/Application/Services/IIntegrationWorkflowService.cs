using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.Services;

public interface IIntegrationWorkflowService
{
    Task<IReadOnlyList<IntegrationConnectionDto>> GetStatusAsync(Guid userId, CancellationToken ct);
    string BuildAsanaAuthUrl(Guid userId);
    string BuildJiraAuthUrl(Guid userId);
    string BuildTrelloAuthorizeUrl();
    Task HandleAsanaCallbackAsync(string code, string state, CancellationToken ct);
    Task HandleJiraCallbackAsync(string code, string state, CancellationToken ct);
    Task ProcessTrelloTokenAsync(Guid userId, string token, CancellationToken ct);
    Task<IReadOnlyList<IntegrationSetupOptionDto>> GetSetupOptionsAsync(Guid userId, ProjectManagementPlatform platform, CancellationToken ct);
    Task CompleteSetupAsync(Guid userId, ProjectManagementPlatform platform, IntegrationSetupPostDto body, CancellationToken ct);
    Task<PushActionItemResponseDto> PushActionItemAsync(Guid userId, ProjectManagementPlatform platform, PushActionItemRequestDto body, CancellationToken ct);
    Task DisconnectAsync(Guid userId, ProjectManagementPlatform platform, CancellationToken ct);
}
