using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IWorkspaceRepository
{
    Workspace? GetWorkspace(Guid id);
    void UpsertWorkspace(Workspace workspace);
    IReadOnlyList<WorkspaceMember> ListMembers(Guid workspaceId);
    WorkspaceMember? FindMember(Guid workspaceId, Guid userId);
    void UpsertMember(WorkspaceMember member);
    void RemoveMember(Guid workspaceId, Guid userId);
}
