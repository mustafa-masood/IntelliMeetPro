using System.ComponentModel.DataAnnotations;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("api/auth/google")]
public class GoogleAuthController : ControllerBase
{
    private readonly IGoogleOAuthService _googleOAuth;
    private readonly GoogleOAuthOptions _opt;

    public GoogleAuthController(IGoogleOAuthService googleOAuth, IOptions<GoogleOAuthOptions> opt)
    {
        _googleOAuth = googleOAuth;
        _opt = opt.Value;
    }

    /// <summary>Public values for building the Google authorization URL in the SPA.</summary>
    [HttpGet("config")]
    public ActionResult<GoogleAuthConfigResponse> GetConfig()
    {
        const string scope =
            "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email openid";
        var url =
            "https://accounts.google.com/o/oauth2/v2/auth" +
            $"?client_id={Uri.EscapeDataString(_opt.ClientId)}" +
            $"&redirect_uri={Uri.EscapeDataString(_opt.RedirectUri)}" +
            "&response_type=code" +
            $"&scope={Uri.EscapeDataString(scope)}" +
            "&access_type=offline" +
            "&prompt=consent";
        return Ok(new GoogleAuthConfigResponse
        {
            ClientId = _opt.ClientId,
            RedirectUri = _opt.RedirectUri,
            Scope = scope,
            AuthorizeUrl = url
        });
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
