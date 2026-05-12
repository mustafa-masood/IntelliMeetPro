using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Infrastructure.Api;

public static class IntegrationUserResolver
{
    public static Guid ResolveUserId(HttpRequest request, IOptions<IntegrationsOptions> options)
    {
        if (request.HttpContext.Items.TryGetValue(RequestUserMiddleware.UserIdKey, out var resolved) && resolved is Guid ctxUser)
            return ctxUser;
        if (request.Headers.TryGetValue("X-IntelliMeet-User-Id", out var h) && Guid.TryParse(h.ToString(), out var g))
            return g;
        if (request.Query.TryGetValue("userId", out var qs) && Guid.TryParse(qs.ToString(), out var g2))
            return g2;
        if (request.HttpContext.Items.TryGetValue(RequestUserMiddleware.DisableLegacyFallbackKey, out var disable)
            && disable is true)
            throw new UnauthorizedAccessException("Authentication required.");
        var def = options.Value.DefaultUserId;
        if (!string.IsNullOrEmpty(def) && Guid.TryParse(def, out var g3))
            return g3;
        return Guid.Parse("11111111-1111-1111-1111-111111111111");
    }
}
