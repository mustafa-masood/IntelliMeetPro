using System.Security.Claims;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Infrastructure.Api;

/// <summary>Maps Clerk JWT or <c>X-IntelliMeet-User-Id</c> to a DB user, workspace, and role.</summary>
public sealed class RequestUserMiddleware
{
    public const string UserIdKey = "IntelliMeet_UserId";
    public const string WorkspaceIdKey = "IntelliMeet_WorkspaceId";
    public const string RoleKey = "IntelliMeet_WorkspaceRole";
    public const string TeamIdKey = "IntelliMeet_TeamId";
    public const string DisableLegacyFallbackKey = "IntelliMeet_DisableLegacyFallback";

    private readonly RequestDelegate _next;

    public RequestUserMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(
        HttpContext ctx,
        IUserRepository users,
        IWorkspaceRepository workspaces,
        IOptions<IntegrationsOptions> integrationOptions,
        IOptions<ClerkOptions> clerkOptions,
        ILogger<RequestUserMiddleware> logger)
    {
        if (ctx.Request.Path.StartsWithSegments("/api/webhooks", StringComparison.OrdinalIgnoreCase))
        {
            await _next(ctx).ConfigureAwait(false);
            return;
        }

        try
        {
            var clerk = clerkOptions.Value;
            string? externalId = null;
            string? email = null;
            string? name = null;
            if (clerk.Enabled)
                ctx.Items[DisableLegacyFallbackKey] = true;

            if (clerk.Enabled && ctx.User?.Identity?.IsAuthenticated == true)
            {
                externalId = ctx.User.FindFirst("sub")?.Value
                             ?? ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                email = ctx.User.FindFirst("email")?.Value
                        ?? ctx.User.FindFirst(ClaimTypes.Email)?.Value;
                name = ctx.User.FindFirst("name")?.Value
                       ?? ctx.User.FindFirst(ClaimTypes.GivenName)?.Value
                       ?? email;
            }

            User? user = null;
            if (!string.IsNullOrEmpty(externalId))
            {
                user = users.GetByExternalUserId(externalId);
                if (user is null)
                {
                    user = ProvisionClerkUser(users, workspaces, externalId, email, name, logger);
                }
            }

            if (user is null)
            {
                var legacyId = IntegrationUserResolver.ResolveUserId(ctx.Request, integrationOptions);
                user = users.GetById(legacyId);
                if (user is null)
                {
                    await _next(ctx).ConfigureAwait(false);
                    return;
                }
            }

            var workspaceId = user.WorkspaceId ?? Guid.Empty;
            var role = WorkspaceMemberRole.Member;
            Guid? teamId = null;
            if (workspaceId != Guid.Empty)
            {
                var member = workspaces.FindMember(workspaceId, user.Id);
                role = member?.Role ?? WorkspaceMemberRole.Member;
                teamId = member?.TeamId;
            }

            ctx.Items[UserIdKey] = user.Id;
            ctx.Items[WorkspaceIdKey] = workspaceId;
            ctx.Items[RoleKey] = role;
            if (teamId is not null)
                ctx.Items[TeamIdKey] = teamId.Value;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Request user resolution failed; continuing without workspace context.");
        }

        await _next(ctx).ConfigureAwait(false);
    }

    private static User ProvisionClerkUser(
        IUserRepository users,
        IWorkspaceRepository workspaces,
        string externalId,
        string? email,
        string? name,
        ILogger logger)
    {
        var now = DateTimeOffset.UtcNow;
        var safeEmail = string.IsNullOrWhiteSpace(email) ? $"{externalId}@users.clerk.local" : email.Trim();
        var display = string.IsNullOrWhiteSpace(name) ? safeEmail.Split('@')[0] : name.Trim();

        var workspace = new Workspace
        {
            Id = Guid.NewGuid(),
            Name = $"{display}'s workspace",
            Plan = WorkspacePlan.Basic,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };
        workspaces.UpsertWorkspace(workspace);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = safeEmail,
            DisplayName = display,
            CreatedAt = now,
            ExternalUserId = externalId,
            ExternalAuthProvider = "Clerk",
            WorkspaceId = workspace.Id,
            CurrentPlan = BillingSubscriptionTier.None,
            SubscriptionStatus = BillingSubscriptionStatus.None
        };
        users.Upsert(user);

        workspaces.UpsertMember(new WorkspaceMember
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspace.Id,
            UserId = user.Id,
            Role = WorkspaceMemberRole.Admin,
            CreatedAtUtc = now
        });

        logger.LogInformation("Provisioned Clerk user {ExternalId} workspace {WorkspaceId}", externalId, workspace.Id);
        return user;
    }
}
