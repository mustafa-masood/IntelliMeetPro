using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboard;

    public DashboardController(IDashboardService dashboard) => _dashboard = dashboard;

    [HttpGet("upcoming-meetings")]
    public async Task<ActionResult<IReadOnlyList<UpcomingMeetingCardDto>>> UpcomingMeetings(CancellationToken ct) =>
        Ok(await _dashboard.GetUpcomingMeetingsAsync(ct).ConfigureAwait(false));

    [HttpGet("calendar")]
    public async Task<ActionResult<IReadOnlyList<DashboardCalendarEntryDto>>> Calendar(CancellationToken ct) =>
        Ok(await _dashboard.GetCalendarFeedAsync(ct).ConfigureAwait(false));

    [HttpPost("bots/join")]
    public async Task<ActionResult<BotJoinResponseDto>> JoinBot([FromBody] BotJoinRequestDto body, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        var res = await _dashboard.RequestBotJoinAsync(body, ct).ConfigureAwait(false);
        return Ok(res);
    }
}
