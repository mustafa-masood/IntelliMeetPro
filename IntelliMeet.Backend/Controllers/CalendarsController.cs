using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("api/calendars")]
public class CalendarsController : ControllerBase
{
    private readonly ICalendarWorkflowService _calendars;

    public CalendarsController(ICalendarWorkflowService calendars) => _calendars = calendars;

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
        var c = await _calendars.ConnectAsync(body, ct).ConfigureAwait(false);
        return Ok(c);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CalendarConnectionDto>>> List(CancellationToken ct) =>
        Ok(await _calendars.ListAsync(ct).ConfigureAwait(false));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CalendarConnectionDto>> Get(Guid id, CancellationToken ct)
    {
        var c = await _calendars.GetAsync(id, ct).ConfigureAwait(false);
        return c is null ? NotFound() : Ok(c);
    }

    [HttpGet("{id:guid}/events")]
    public async Task<ActionResult<IReadOnlyList<CalendarEventDto>>> Events(Guid id, CancellationToken ct) =>
        Ok(await _calendars.ListEventsAsync(id, ct).ConfigureAwait(false));

    [HttpPost("{id:guid}/sync")]
    public async Task<IActionResult> Sync(Guid id, CancellationToken ct)
    {
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
        var r = await _calendars.ScheduleBotAsync(id, body, ct).ConfigureAwait(false);
        return Ok(r);
    }
}
