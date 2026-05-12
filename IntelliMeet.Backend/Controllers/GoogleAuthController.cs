using System.ComponentModel.DataAnnotations;
using IntelliMeet.Backend.Infrastructure.Api;
using IntelliMeet.Backend.Infrastructure.GoogleAuth;
using IntelliMeet.Backend.Infrastructure.Persistence;
using IntelliMeet.Backend.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("api/auth/google")]
public class GoogleAuthController : ControllerBase
{
    private readonly IGoogleOAuthService _googleOAuth;
    private readonly IOptions<GoogleOptions> _googleOpt;
    private readonly IOptions<IntegrationsOptions> _integrations;
    private readonly IDbContextFactory<IntelliMeetDbContext> _dbFactory;

    public GoogleAuthController(
        IGoogleOAuthService googleOAuth,
        IOptions<GoogleOptions> googleOpt,
        IOptions<IntegrationsOptions> integrations,
        IDbContextFactory<IntelliMeetDbContext> dbFactory)
    {
        _googleOAuth = googleOAuth;
        _googleOpt = googleOpt;
        _integrations = integrations;
        _dbFactory = dbFactory;
    }

    /// <summary>Server-side Google connect entrypoint used by App Integrations.</summary>
    [HttpGet("connect")]
    public IActionResult Connect([FromQuery] Guid? userId = null)
    {
        var uid = userId ?? IntegrationUserResolver.ResolveUserId(Request, _integrations);
        var g = _googleOpt.Value;
        if (string.IsNullOrWhiteSpace(g.ClientId) || string.IsNullOrWhiteSpace(g.RedirectUri))
            return BadRequest("Google is not configured.");
        var scopes = string.IsNullOrWhiteSpace(g.Scopes)
            ? "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email openid"
            : g.Scopes.Trim();
        var url =
            "https://accounts.google.com/o/oauth2/v2/auth" +
            $"?client_id={Uri.EscapeDataString(g.ClientId)}" +
            $"&redirect_uri={Uri.EscapeDataString(g.RedirectUri)}" +
            "&response_type=code" +
            $"&scope={Uri.EscapeDataString(scopes)}" +
            "&access_type=offline" +
            "&prompt=consent" +
            $"&state={Uri.EscapeDataString(uid.ToString())}";
        return Redirect(url);
    }

    /// <summary>Public values for building the Google authorization URL in the SPA.</summary>
    [HttpGet("config")]
    public ActionResult<GoogleAuthConfigResponse> GetConfig()
    {
        var g = _googleOpt.Value;
        var scope = string.IsNullOrWhiteSpace(g.Scopes)
            ? "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email openid"
            : g.Scopes.Trim();
        var url =
            "https://accounts.google.com/o/oauth2/v2/auth" +
            $"?client_id={Uri.EscapeDataString(g.ClientId)}" +
            $"&redirect_uri={Uri.EscapeDataString(g.RedirectUri)}" +
            "&response_type=code" +
            $"&scope={Uri.EscapeDataString(scope)}" +
            "&access_type=offline" +
            "&prompt=consent";
        return Ok(new GoogleAuthConfigResponse
        {
            ClientId = g.ClientId,
            RedirectUri = g.RedirectUri,
            Scope = scope,
            AuthorizeUrl = url
        });
    }

    /// <summary>OAuth callback for server-side Google Calendar connect (<c>Google:RedirectUri</c>).</summary>
    [HttpGet("callback")]
    public async Task<IActionResult> ServerCallback([FromQuery] string? code, [FromQuery] string? state, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(code))
            return BadRequest("Missing code.");
        if (!Guid.TryParse(state, out var userId))
            return BadRequest("Invalid state.");
        // TODO(Mustafa): CSRF-safe state parameter (signed nonce), not only user id.

        var redirectUri = string.IsNullOrWhiteSpace(_googleOpt.Value.RedirectUri)
            ? null
            : _googleOpt.Value.RedirectUri.Trim();
        if (string.IsNullOrEmpty(redirectUri))
            return BadRequest("Google:RedirectUri is not configured for server OAuth callback.");

        var r = await _googleOAuth.ExchangeAuthorizationCodeAsync(code, ct, redirectUri).ConfigureAwait(false);
        if (!r.Success || string.IsNullOrEmpty(r.AccessToken))
            return BadRequest(r.Error ?? "Token exchange failed.");

        await using var db = await _dbFactory.CreateDbContextAsync(ct).ConfigureAwait(false);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct).ConfigureAwait(false);
        if (user is null)
            return BadRequest("User not found for state.");

        user.CalendarConnected = true;
        user.GoogleAccessToken = r.AccessToken;
        if (!string.IsNullOrEmpty(r.RefreshToken))
            user.GoogleRefreshToken = r.RefreshToken;
        user.GoogleTokenExpiryUtc = DateTimeOffset.UtcNow.AddSeconds(Math.Max(60, r.ExpiresInSeconds));
        if (!string.IsNullOrEmpty(r.Email))
            user.Email = r.Email;
        await db.SaveChangesAsync(ct).ConfigureAwait(false);

        var spa = string.IsNullOrWhiteSpace(_googleOpt.Value.SpaPostConnectUrl)
            ? "http://localhost:5173/calendar"
            : _googleOpt.Value.SpaPostConnectUrl.Trim();
        var join = spa.Contains('?', StringComparison.Ordinal) ? '&' : '?';
        return Redirect($"{spa}{join}setup=calendar");
    }

    [HttpPost("token")]
    public async Task<ActionResult<GoogleTokenResponse>> ExchangeCode([FromBody] ExchangeCodeRequest body, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        var r = await _googleOAuth.ExchangeAuthorizationCodeAsync(body.Code, ct).ConfigureAwait(false);
        if (!r.Success)
            return BadRequest(new { success = false, error = r.Error });
        return Ok(new GoogleTokenResponse
        {
            RefreshToken = r.RefreshToken,
            AccessToken = r.AccessToken,
            ExpiresIn = r.ExpiresInSeconds,
            Email = r.Email
        });
    }
}

public sealed class GoogleAuthConfigResponse
{
    public string ClientId { get; set; } = string.Empty;
    public string RedirectUri { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public string AuthorizeUrl { get; set; } = string.Empty;
}

public sealed class ExchangeCodeRequest
{
    [Required]
    public string Code { get; set; } = string.Empty;
}

public sealed class GoogleTokenResponse
{
    public string? RefreshToken { get; set; }
    public string? AccessToken { get; set; }
    public int ExpiresIn { get; set; }
    public string? Email { get; set; }
}
