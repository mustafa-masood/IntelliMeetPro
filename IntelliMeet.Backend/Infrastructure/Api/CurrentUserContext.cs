using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Infrastructure.Api;

public sealed class CurrentUserContext : ICurrentUserContext
{
    private readonly IHttpContextAccessor _http;

    public CurrentUserContext(IHttpContextAccessor http) => _http = http;

    private HttpContext? Ctx => _http.HttpContext;

    public bool IsResolved => Ctx?.Items.ContainsKey(RequestUserMiddleware.UserIdKey) == true;

    public Guid UserId => Ctx?.Items[RequestUserMiddleware.UserIdKey] is Guid g ? g : Guid.Empty;

    public Guid WorkspaceId => Ctx?.Items[RequestUserMiddleware.WorkspaceIdKey] is Guid w ? w : Guid.Empty;

    public Guid? TeamId => Ctx?.Items[RequestUserMiddleware.TeamIdKey] is Guid t ? t : null;

    public WorkspaceMemberRole Role =>
        Ctx?.Items[RequestUserMiddleware.RoleKey] is WorkspaceMemberRole r ? r : WorkspaceMemberRole.Member;
}
