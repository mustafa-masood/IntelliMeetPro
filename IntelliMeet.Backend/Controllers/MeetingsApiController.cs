using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("api/meetings")]
public class MeetingsApiController : ControllerBase
{
    private readonly IMeetingsApiService _meetings;
    private readonly IMeetingRepository _meetingRepository;
    private readonly IMeetingAnalysisQueue _analysisQueue;

    public MeetingsApiController(
        IMeetingsApiService meetings,
        IMeetingRepository meetingRepository,
        IMeetingAnalysisQueue analysisQueue)
    {
        _meetings = meetings;
        _meetingRepository = meetingRepository;
        _analysisQueue = analysisQueue;
    }

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

    [HttpPost("{id:guid}/action-items/{actionItemId:guid}/assign-user")]
    public async Task<ActionResult<ActionItemDto>> AssignActionItemUser(
        Guid id,
        Guid actionItemId,
        [FromBody] AssignActionItemUserRequestDto body,
        CancellationToken ct)
    {
        try
        {
            var a = await _meetings.AssignActionItemUserAsync(id, actionItemId, body, ct).ConfigureAwait(false);
            return Ok(a);
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

    /// <summary>Resolves transcript (including Meeting BaaS artifact URLs), runs Ollama JSON analysis, persists summary / key points / action items. Work is queued so this endpoint returns immediately.</summary>
    [HttpPost("{id:guid}/analyze")]
    public async Task<IActionResult> Analyze(
        Guid id,
        [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] AnalyzeMeetingRequestDto? body,
        CancellationToken ct)
    {
        if (_meetingRepository.GetById(id) is null)
            return NotFound();

        await _analysisQueue.EnqueueAsync(id, body?.Force ?? false, ct).ConfigureAwait(false);
        return Ok(new { ok = true, status = "queued" });
    }
}
