using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Application.Services;
using IntelliMeet.Backend.Domain.Enums;
using IntelliMeet.Backend.Infrastructure.Api;
using IntelliMeet.Backend.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("api/integrations")]
public sealed class IntegrationsController : ControllerBase
{
    private readonly IIntegrationWorkflowService _workflow;
    private readonly IOptions<IntegrationsOptions> _opt;

    public IntegrationsController(IIntegrationWorkflowService workflow, IOptions<IntegrationsOptions> opt)
    {
        _workflow = workflow;
        _opt = opt;
    }

    [HttpGet("status")]
    public async Task<ActionResult<IReadOnlyList<IntegrationConnectionDto>>> Status(CancellationToken ct)
    {
        var userId = IntegrationUserResolver.ResolveUserId(Request, _opt);
        return Ok(await _workflow.GetStatusAsync(userId, ct).ConfigureAwait(false));
    }

    [HttpGet("asana/auth")]
    public IActionResult AsanaAuth()
    {
        var userId = IntegrationUserResolver.ResolveUserId(Request, _opt);
        var url = _workflow.BuildAsanaAuthUrl(userId);
        return Redirect(url);
    }

    [HttpGet("jira/auth")]
    public IActionResult JiraAuth()
    {
        var userId = IntegrationUserResolver.ResolveUserId(Request, _opt);
        var url = _workflow.BuildJiraAuthUrl(userId);
        return Redirect(url);
    }

    /// <summary>Redirects browser to Trello token authorization (client receives #token=… on return URL).</summary>
    [HttpGet("trello/auth")]
    public IActionResult TrelloAuth()
    {
        var url = _workflow.BuildTrelloAuthorizeUrl();
        return Redirect(url);
    }

    [HttpGet("asana/callback")]
    public async Task<IActionResult> AsanaCallback([FromQuery] string? code, [FromQuery] string? state, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(code))
            return BadRequest("Missing code.");
        await _workflow.HandleAsanaCallbackAsync(code, state ?? "", ct).ConfigureAwait(false);
        var spa = _opt.Value.SpaBaseUrl.TrimEnd('/');
        return Redirect($"{spa}/deferred/app-integrations?setup=asana");
    }

    [HttpGet("jira/callback")]
    public async Task<IActionResult> JiraCallback([FromQuery] string? code, [FromQuery] string? state, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(code))
            return BadRequest("Missing code.");
        await _workflow.HandleJiraCallbackAsync(code, state ?? "", ct).ConfigureAwait(false);
        var spa = _opt.Value.SpaBaseUrl.TrimEnd('/');
        return Redirect($"{spa}/deferred/app-integrations?setup=jira");
    }

    [HttpPost("trello/process-token")]
    public async Task<IActionResult> TrelloProcessToken([FromBody] TrelloProcessTokenDto body, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Token))
            return BadRequest("Token required.");
        var userId = body.UserId ?? IntegrationUserResolver.ResolveUserId(Request, _opt);
        await _workflow.ProcessTrelloTokenAsync(userId, body.Token.Trim(), ct).ConfigureAwait(false);
        return Ok(new { ok = true });
    }

    [HttpGet("asana/setup")]
    public async Task<ActionResult<IReadOnlyList<IntegrationSetupOptionDto>>> AsanaSetup(CancellationToken ct)
    {
        var userId = IntegrationUserResolver.ResolveUserId(Request, _opt);
        return Ok(await _workflow.GetSetupOptionsAsync(userId, ProjectManagementPlatform.Asana, ct).ConfigureAwait(false));
    }

    [HttpGet("jira/setup")]
    public async Task<ActionResult<IReadOnlyList<IntegrationSetupOptionDto>>> JiraSetup(CancellationToken ct)
    {
        var userId = IntegrationUserResolver.ResolveUserId(Request, _opt);
        return Ok(await _workflow.GetSetupOptionsAsync(userId, ProjectManagementPlatform.Jira, ct).ConfigureAwait(false));
    }

    [HttpGet("trello/setup")]
    public async Task<ActionResult<IReadOnlyList<IntegrationSetupOptionDto>>> TrelloSetup(CancellationToken ct)
    {
        var userId = IntegrationUserResolver.ResolveUserId(Request, _opt);
        return Ok(await _workflow.GetSetupOptionsAsync(userId, ProjectManagementPlatform.Trello, ct).ConfigureAwait(false));
    }

    [HttpPost("asana/setup")]
    public async Task<IActionResult> AsanaSetupPost([FromBody] IntegrationSetupPostDto body, CancellationToken ct)
    {
        var userId = IntegrationUserResolver.ResolveUserId(Request, _opt);
        await _workflow.CompleteSetupAsync(userId, ProjectManagementPlatform.Asana, body, ct).ConfigureAwait(false);
        return Ok(new { ok = true });
    }

    [HttpPost("jira/setup")]
    public async Task<IActionResult> JiraSetupPost([FromBody] IntegrationSetupPostDto body, CancellationToken ct)
    {
        var userId = IntegrationUserResolver.ResolveUserId(Request, _opt);
        await _workflow.CompleteSetupAsync(userId, ProjectManagementPlatform.Jira, body, ct).ConfigureAwait(false);
        return Ok(new { ok = true });
    }

    [HttpPost("trello/setup")]
    public async Task<IActionResult> TrelloSetupPost([FromBody] IntegrationSetupPostDto body, CancellationToken ct)
    {
        var userId = IntegrationUserResolver.ResolveUserId(Request, _opt);
        await _workflow.CompleteSetupAsync(userId, ProjectManagementPlatform.Trello, body, ct).ConfigureAwait(false);
        return Ok(new { ok = true });
    }

    [HttpPost("asana/push-action-item")]
    public async Task<ActionResult<PushActionItemResponseDto>> AsanaPush([FromBody] PushActionItemRequestDto body, CancellationToken ct)
    {
        var userId = body.UserId ?? IntegrationUserResolver.ResolveUserId(Request, _opt);
        var r = await _workflow.PushActionItemAsync(userId, ProjectManagementPlatform.Asana, body, ct).ConfigureAwait(false);
        return Ok(r);
    }

    [HttpPost("jira/push-action-item")]
    public async Task<ActionResult<PushActionItemResponseDto>> JiraPush([FromBody] PushActionItemRequestDto body, CancellationToken ct)
    {
        var userId = body.UserId ?? IntegrationUserResolver.ResolveUserId(Request, _opt);
        var r = await _workflow.PushActionItemAsync(userId, ProjectManagementPlatform.Jira, body, ct).ConfigureAwait(false);
        return Ok(r);
    }

    [HttpPost("trello/push-action-item")]
    public async Task<ActionResult<PushActionItemResponseDto>> TrelloPush([FromBody] PushActionItemRequestDto body, CancellationToken ct)
    {
        var userId = body.UserId ?? IntegrationUserResolver.ResolveUserId(Request, _opt);
        var r = await _workflow.PushActionItemAsync(userId, ProjectManagementPlatform.Trello, body, ct).ConfigureAwait(false);
        return Ok(r);
    }

    [HttpDelete("asana/connection")]
    public async Task<IActionResult> DisconnectAsana(CancellationToken ct)
    {
        var userId = IntegrationUserResolver.ResolveUserId(Request, _opt);
        await _workflow.DisconnectAsync(userId, ProjectManagementPlatform.Asana, ct).ConfigureAwait(false);
        return NoContent();
    }

    [HttpDelete("jira/connection")]
    public async Task<IActionResult> DisconnectJira(CancellationToken ct)
    {
        var userId = IntegrationUserResolver.ResolveUserId(Request, _opt);
        await _workflow.DisconnectAsync(userId, ProjectManagementPlatform.Jira, ct).ConfigureAwait(false);
        return NoContent();
    }

    [HttpDelete("trello/connection")]
    public async Task<IActionResult> DisconnectTrello(CancellationToken ct)
    {
        var userId = IntegrationUserResolver.ResolveUserId(Request, _opt);
        await _workflow.DisconnectAsync(userId, ProjectManagementPlatform.Trello, ct).ConfigureAwait(false);
        return NoContent();
    }
}
