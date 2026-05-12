using IntelliMeet.Backend.Application.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class MeetingTeamResolver : IMeetingTeamResolver
{
    private readonly IntelliMeetDbContext _db;
    private readonly IWorkspaceRepository _workspaces;

    public MeetingTeamResolver(IntelliMeetDbContext db, IWorkspaceRepository workspaces)
    {
        _db = db;
        _workspaces = workspaces;
    }

    public Guid? ResolveTeamForNewMeeting(Guid organizerUserId, Guid? workspaceId, Guid? requestedTeamId)
    {
        if (workspaceId is null || workspaceId == Guid.Empty)
            return null;

        var wsId = workspaceId.Value;

        if (!_db.Teams.AsNoTracking().Any(t => t.WorkspaceId == wsId))
            return null;

        if (requestedTeamId is Guid req &&
            _db.Teams.AsNoTracking().Any(t => t.WorkspaceId == wsId && t.Id == req))
            return req;

        var member = _workspaces.FindMember(wsId, organizerUserId);
        if (member?.TeamId is Guid mt &&
            _db.Teams.AsNoTracking().Any(t => t.WorkspaceId == wsId && t.Id == mt))
            return mt;

        var teams = _db.Teams.AsNoTracking().Where(t => t.WorkspaceId == wsId).OrderBy(t => t.Name).ToList();
        if (teams.Count == 0)
            return null;

        var nonGeneral = teams
            .Where(t => !string.Equals(t.Name, "General", StringComparison.OrdinalIgnoreCase))
            .ToList();
        // Enterprise admin with no team: if exactly one "named" squad exists beside General, tag meetings there (e.g. General + Frontend).
        if (nonGeneral.Count == 1)
            return nonGeneral[0].Id;

        var general = teams.FirstOrDefault(t =>
            string.Equals(t.Name, "General", StringComparison.OrdinalIgnoreCase));
        if (general is not null)
            return general.Id;

        return teams[0].Id;
    }
}
