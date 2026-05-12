namespace IntelliMeet.Backend.Application.Abstractions;

/// <summary>Assigns Meeting.TeamId when creating meetings in enterprise workspaces.</summary>
public interface IMeetingTeamResolver
{
    /// <param name="requestedTeamId">Optional explicit team from API (must belong to workspace).</param>
    Guid? ResolveTeamForNewMeeting(Guid organizerUserId, Guid? workspaceId, Guid? requestedTeamId);
}
