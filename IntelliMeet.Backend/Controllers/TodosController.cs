using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("api/todos")]
public class TodosController : ControllerBase
{
    private readonly ITodoWorkflowService _todos;

    public TodosController(ITodoWorkflowService todos) => _todos = todos;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TodoItemDto>>> List([FromQuery] Guid? userId, CancellationToken ct) =>
        Ok(await _todos.ListAsync(userId, ct).ConfigureAwait(false));

    [HttpPost]
    public async Task<ActionResult<TodoItemDto>> Create([FromBody] CreateTodoRequestDto body, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        var t = await _todos.CreateAsync(body, ct).ConfigureAwait(false);
        return Ok(t);
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<TodoItemDto>> Patch(Guid id, [FromBody] PatchTodoRequestDto body, CancellationToken ct)
    {
        var t = await _todos.PatchAsync(id, body, ct).ConfigureAwait(false);
        return t is null ? NotFound() : Ok(t);
    }

    [HttpPost("from-action-item")]
    public async Task<ActionResult<TodoItemDto>> FromActionItem([FromBody] TodoFromActionItemRequestDto body, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        var t = await _todos.FromActionItemAsync(body, ct).ConfigureAwait(false);
        return Ok(t);
    }
}
