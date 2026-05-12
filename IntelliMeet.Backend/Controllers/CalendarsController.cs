using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Application.Services;
using IntelliMeet.Backend.Infrastructure.Api;
using IntelliMeet.Backend.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("api/calendars")]
public class CalendarsController : ControllerBase
{
    private readonly ICalendarWorkflowService _calendars;
    private readonly IOptions<IntegrationsOptions> _integrationOptions;

    public CalendarsController(ICalendarWorkflowService calendars, IOptions<IntegrationsOptions> integrationOptions)
    {
        _calendars = calendars;
        _integrationOptions = integrationOptions;
    }

    private Guid CurrentUserId() => IntegrationUserResolver.ResolveUserId(Request, _integrationOptions);

    [HttpPost("google/list-raw")]
    public async Task<ActionResult<IReadOnlyList<RawCalendarItemDto>>> ListRawGoogle([FromBody] ListRawCalendarsRequestDto body, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.RefreshToken))
            return BadRequest("RefreshToken is required.");
        var list = await _calendars.ListRawGoogleCalendarsAsync(body.RefreshToken, ct).ConfigureAwait(false);
        return Ok(list);
    }

    [HttpPost("connect")]
    public async Task<ActionResult<CalendarConnectionDto>> Connect([FromBody] ConnectCalendarRequestDto body, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        body.UserId = CurrentUserId();
        var c = await _calendars.ConnectAsync(body, ct).ConfigureAwait(false);
        return Ok(c);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CalendarConnectionDto>>> List(CancellationToken ct) =>
        Ok(await _calendars.ListAsync(CurrentUserId(), ct).ConfigureAwait(false));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Disconnect(Guid id, CancellationToken ct)
    {
        try
        {
            await _calendars.DisconnectAsync(id, CurrentUserId(), ct).ConfigureAwait(false);
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

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CalendarConnectionDto>> Get(Guid id, CancellationToken ct)
    {
        var c = await _calendars.GetAsync(id, ct).ConfigureAwait(false);
        if (c is null || c.UserId != CurrentUserId())
            return NotFound();
        return Ok(c);
    }

    [HttpGet("{id:guid}/events")]
    public async Task<ActionResult<IReadOnlyList<CalendarEventDto>>> Events(Guid id, CancellationToken ct)
    {
        var c = await _calendars.GetAsync(id, ct).ConfigureAwait(false);
        if (c is null || c.UserId != CurrentUserId())
            return NotFound();
        return Ok(await _calendars.ListEventsAsync(id, ct).ConfigureAwait(false));
    }

    [HttpPost("{id:guid}/sync")]
    public async Task<IActionResult> Sync(Guid id, CancellationToken ct)
    {
        var c = await _calendars.GetAsync(id, ct).ConfigureAwait(false);
        if (c is null || c.UserId != CurrentUserId())
            return NotFound();
        await _calendars.SyncAsync(id, ct).ConfigureAwait(false);
        return NoContent();
    }

    [HttpPost("{id:guid}/schedule-bot")]
    public async Task<ActionResult<ScheduleCalendarBotResponseDto>> ScheduleBot(
        Guid id,
        [FromBody] ScheduleCalendarBotRequestDto body,
        CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        var c = await _calendars.GetAsync(id, ct).ConfigureAwait(false);
        if (c is null || c.UserId != CurrentUserId())
            return NotFound();
        var r = await _calendars.ScheduleBotAsync(id, body, ct).ConfigureAwait(false);
        return Ok(r);
    }
}
