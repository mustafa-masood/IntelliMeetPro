using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("api/meetings")]
public class MeetingsApiController : ControllerBase
{
    private readonly IMeetingsApiService _meetings;

    public MeetingsApiController(IMeetingsApiService meetings) => _meetings = meetings;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MeetingListItemDto>>> List(CancellationToken ct) =>
        Ok(await _meetings.ListAsync(ct).ConfigureAwait(false));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MeetingDetailDto>> Get(Guid id, CancellationToken ct)
    {
        var m = await _meetings.GetDetailAsync(id, ct).ConfigureAwait(false);
        return m is null ? NotFound() : Ok(m);
    }

    [HttpGet("{id:guid}/transcript")]
    public async Task<ActionResult<TranscriptDto>> Transcript(Guid id, CancellationToken ct)
    {
        var t = await _meetings.GetTranscriptAsync(id, ct).ConfigureAwait(false);
        return t is null ? NotFound() : Ok(t);
    }

    [HttpGet("{id:guid}/summary")]
    public async Task<ActionResult<MeetingSummaryDto>> Summary(Guid id, CancellationToken ct)
    {
        var s = await _meetings.GetSummaryAsync(id, ct).ConfigureAwait(false);
        return s is null ? NotFound() : Ok(s);
    }

    [HttpGet("{id:guid}/action-items")]
    public async Task<ActionResult<IReadOnlyList<ActionItemDto>>> ActionItems(Guid id, CancellationToken ct) =>
        Ok(await _meetings.GetActionItemsAsync(id, ct).ConfigureAwait(false));

    [HttpPost("{id:guid}/action-items/{actionItemId:guid}/convert-to-todo")]
    public async Task<ActionResult<TodoItemDto>> ConvertToTodo(
        Guid id,
        Guid actionItemId,
        [FromBody] ConvertActionItemToTodoRequestDto? body,
        CancellationToken ct)
    {
        var dto = await _meetings.ConvertActionItemToTodoAsync(id, actionItemId, body?.UserId, body?.TodoType, ct)
            .ConfigureAwait(false);
        return Ok(dto);
    }

    [HttpPost("{id:guid}/assign-task")]
    public async Task<ActionResult<ActionItemDto>> AssignTask(Guid id, [FromBody] AssignTaskRequestDto body, CancellationToken ct)
    {
        var a = await _meetings.AssignTaskAsync(id, body, ct).ConfigureAwait(false);
        return Ok(a);
    }
}
