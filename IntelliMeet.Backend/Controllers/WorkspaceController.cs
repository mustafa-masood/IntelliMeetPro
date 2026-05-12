using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;
using IntelliMeet.Backend.Infrastructure.Api;
using IntelliMeet.Backend.Infrastructure.Persistence;
using IntelliMeet.Backend.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("api/workspace")]
public sealed class WorkspaceController : ControllerBase
{
    private readonly IUserRepository _users;
    private readonly IWorkspaceRepository _workspaces;
    private readonly IOptions<IntegrationsOptions> _integrationOptions;
    private readonly IntelliMeetDbContext _db;
    private readonly ICurrentUserContext _current;

    public WorkspaceController(
        IUserRepository users,
        IWorkspaceRepository workspaces,
        IOptions<IntegrationsOptions> integrationOptions,
        IntelliMeetDbContext db,
        ICurrentUserContext current)
    {
        _users = users;
        _workspaces = workspaces;
        _integrationOptions = integrationOptions;
        _db = db;
        _current = current;
    }

    private Guid CurrentUserId()
    {
        if (_current.IsResolved)
            return _current.UserId;

        // Legacy fallback for non-Clerk/demo flows (still allowed to resolve an identity, but will be gated by plan).
        return IntegrationUserResolver.ResolveUserId(Request, _integrationOptions);
    }

    private (User me, Workspace ws, WorkspaceMemberRole role) RequireEnterpriseAdmin()
    {
        var me = _users.GetById(CurrentUserId()) ?? throw new KeyNotFoundException("User not found.");

        var isEnterprise = me.CurrentPlan == BillingSubscriptionTier.Enterprise &&
                           me.SubscriptionStatus == BillingSubscriptionStatus.Active;
        if (!isEnterprise)
            throw new InvalidOperationException("Enterprise plan required.");

        if (me.WorkspaceId is not Guid wsId || wsId == Guid.Empty)
            throw new InvalidOperationException("No workspace assigned.");
        var role = _workspaces.FindMember(wsId, me.Id)?.Role ?? WorkspaceMemberRole.Member;
        if (role != WorkspaceMemberRole.Admin)
            throw new InvalidOperationException("Admin role required.");
        var ws = _workspaces.GetWorkspace(wsId) ?? throw new KeyNotFoundException("Workspace not found.");
        return (me, ws, role);
    }

    [HttpGet]
    public ActionResult<WorkspaceSummaryDto> Get()
    {
        try
        {
            var (_, ws, _) = RequireEnterpriseAdmin();
            var teamsById = _db.Teams.Where(t => t.WorkspaceId == ws.Id).ToDictionary(t => t.Id, t => t.Name);
            var members = _workspaces.ListMembers(ws.Id).Select(m =>
            {
                var u = _users.GetById(m.UserId);
                var teamName = m.TeamId.HasValue && teamsById.TryGetValue(m.TeamId.Value, out var n) ? n : null;
                return new WorkspaceMemberRowDto
                {
                    UserId = m.UserId,
                    Email = u?.Email ?? "",
                    DisplayName = u?.DisplayName ?? "",
                    Role = m.Role,
                    TeamId = m.TeamId,
                    TeamName = teamName
                };
            }).ToList();
            return Ok(new WorkspaceSummaryDto
            {
                WorkspaceId = ws.Id,
                Name = ws.Name,
                Plan = ws.Plan,
                Members = members
            });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("members/invite")]
    public IActionResult Invite([FromBody] WorkspaceInviteRequestDto body)
    {
        try
        {
            var (_, ws, _) = RequireEnterpriseAdmin();
            if (string.IsNullOrWhiteSpace(body.Email))
                return BadRequest("Email required.");
            if (body.TeamId.HasValue && !_db.Teams.Any(t => t.WorkspaceId == ws.Id && t.Id == body.TeamId.Value))
                return BadRequest("Team not found.");
            var target = _users.GetByEmail(body.Email.Trim());
            if (target is null)
                return BadRequest("User must sign up before they can be invited.");
            if (target.WorkspaceId == ws.Id && _workspaces.FindMember(ws.Id, target.Id) is not null)
                return NoContent();

            var now = DateTimeOffset.UtcNow;
            // Move user into this workspace (single-workspace model).
            var oldRows = _db.WorkspaceMembers.Where(x => x.UserId == target.Id).ToList();
            if (oldRows.Count > 0)
            {
                _db.WorkspaceMembers.RemoveRange(oldRows);
                _db.SaveChanges();
            }
            target.WorkspaceId = ws.Id;
            _users.Upsert(target);
            var existing = _workspaces.FindMember(ws.Id, target.Id);
            if (existing is null)
            {
                _workspaces.UpsertMember(new WorkspaceMember
                {
                    Id = Guid.NewGuid(),
                    WorkspaceId = ws.Id,
                    UserId = target.Id,
                    Role = WorkspaceMemberRole.Member,
                    TeamId = body.TeamId,
                    CreatedAtUtc = now
                });
            }
            else if (existing.Role == WorkspaceMemberRole.Admin)
            {
                // keep admin
            }
            else if (body.TeamId.HasValue && existing.TeamId != body.TeamId)
            {
                // Update team assignment when re-inviting an existing member.
                var tracked = _db.WorkspaceMembers.FirstOrDefault(x => x.WorkspaceId == ws.Id && x.UserId == target.Id);
                if (tracked is not null)
                {
                    tracked.TeamId = body.TeamId;
                    _db.SaveChanges();
                }
            }
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("members/change-role")]
    public IActionResult ChangeRole([FromBody] WorkspaceChangeRoleRequestDto body)
    {
        try
        {
            var (_, ws, _) = RequireEnterpriseAdmin();
            var trackedMembers = _db.WorkspaceMembers.Where(x => x.WorkspaceId == ws.Id).ToList();
            var target = trackedMembers.FirstOrDefault(x => x.UserId == body.UserId)
                         ?? throw new KeyNotFoundException("Member not found.");
            if (body.Role == WorkspaceMemberRole.Admin)
            {
                foreach (var m in trackedMembers)
                    m.Role = WorkspaceMemberRole.Member;
            }
            target.Role = body.Role;
            _db.SaveChanges();
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("members/remove")]
    public IActionResult Remove([FromBody] WorkspaceRemoveMemberRequestDto body)
    {
        try
        {
            var (me, ws, _) = RequireEnterpriseAdmin();
            if (body.UserId == me.Id)
                return BadRequest("Cannot remove yourself.");
            var admins = _workspaces.ListMembers(ws.Id).Count(m => m.Role == WorkspaceMemberRole.Admin);
            var targetMember = _workspaces.FindMember(ws.Id, body.UserId)
                               ?? throw new KeyNotFoundException("Member not found.");
            if (targetMember.Role == WorkspaceMemberRole.Admin && admins <= 1)
                return BadRequest("Cannot remove the last admin.");
            _workspaces.RemoveMember(ws.Id, body.UserId);
            var orphan = _users.GetTrackedById(body.UserId);
            if (orphan is not null)
            {
                var now = DateTimeOffset.UtcNow;
                var personal = new Workspace
                {
                    Id = Guid.NewGuid(),
                    Name = $"{orphan.DisplayName}'s workspace",
                    Plan = WorkspacePlan.Basic,
                    CreatedAtUtc = now,
                    UpdatedAtUtc = now
                };
                _workspaces.UpsertWorkspace(personal);
                orphan.WorkspaceId = personal.Id;
                _users.Upsert(orphan);
                _workspaces.UpsertMember(new WorkspaceMember
                {
                    Id = Guid.NewGuid(),
                    WorkspaceId = personal.Id,
                    UserId = orphan.Id,
                    Role = WorkspaceMemberRole.Admin,
                    CreatedAtUtc = now
                });
            }
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("teams")]
    public ActionResult<IReadOnlyList<TeamRowDto>> ListTeams()
    {
        try
        {
            var (_, ws, _) = RequireEnterpriseAdmin();
            var teams = _db.Teams
                .Where(t => t.WorkspaceId == ws.Id)
                .OrderBy(t => t.Name)
                .Select(t => new TeamRowDto { Id = t.Id, Name = t.Name })
                .ToList();
            return Ok(teams);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("teams")]
    public ActionResult<TeamRowDto> CreateTeam([FromBody] CreateTeamRequestDto body)
    {
        try
        {
            var (_, ws, _) = RequireEnterpriseAdmin();
            var name = (body.Name ?? "").Trim();
            if (string.IsNullOrWhiteSpace(name))
                return BadRequest("Name required.");
            if (name.Length > 128)
                return BadRequest("Name too long.");
            if (_db.Teams.Any(t => t.WorkspaceId == ws.Id && t.Name == name))
                return BadRequest("Team already exists.");

            var now = DateTimeOffset.UtcNow;
            var team = new Team
            {
                Id = Guid.NewGuid(),
                WorkspaceId = ws.Id,
                Name = name,
                CreatedAtUtc = now,
                UpdatedAtUtc = now
            };
            _db.Teams.Add(team);
            _db.SaveChanges();
            return Ok(new TeamRowDto { Id = team.Id, Name = team.Name });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("members/assign-team")]
    public IActionResult AssignTeam([FromBody] AssignMemberTeamRequestDto body)
    {
        try
        {
            var (me, ws, _) = RequireEnterpriseAdmin();
            if (body.UserId == Guid.Empty)
                return BadRequest("UserId required.");
            if (body.UserId == me.Id)
                return BadRequest("Cannot change your own team here.");
            if (body.TeamId.HasValue && !_db.Teams.Any(t => t.WorkspaceId == ws.Id && t.Id == body.TeamId.Value))
                return BadRequest("Team not found.");

            var member = _db.WorkspaceMembers.FirstOrDefault(m => m.WorkspaceId == ws.Id && m.UserId == body.UserId)
                         ?? throw new KeyNotFoundException("Member not found.");
            member.TeamId = body.TeamId;
            _db.SaveChanges();
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
