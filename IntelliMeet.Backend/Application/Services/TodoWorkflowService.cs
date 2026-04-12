using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.Services;

public sealed class TodoWorkflowService : ITodoWorkflowService
{
    private readonly ITodoRepository _todos;
    private readonly IActionItemRepository _actionItems;
    private readonly IMeetingRepository _meetings;
    private readonly IMeetingsApiService _meetingsApi;

    public TodoWorkflowService(
        ITodoRepository todos,
        IActionItemRepository actionItems,
        IMeetingRepository meetings,
        IMeetingsApiService meetingsApi)
    {
        _todos = todos;
        _actionItems = actionItems;
        _meetings = meetings;
        _meetingsApi = meetingsApi;
    }

    public Task<IReadOnlyList<TodoItemDto>> ListAsync(Guid? userId, CancellationToken ct)
    {
        var list = _todos.GetAll(userId).Select(Map).ToList();
        return Task.FromResult<IReadOnlyList<TodoItemDto>>(list);
    }

    public Task<TodoItemDto> CreateAsync(CreateTodoRequestDto body, CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var t = new TodoItem
        {
            Id = Guid.NewGuid(),
            UserId = body.UserId,
            Title = body.Title,
            Description = body.Description,
            Type = body.Type,
            DueDate = body.DueDate,
            Status = TodoStatus.Open,
            CreatedAt = now,
            UpdatedAt = now
        };
        _todos.Upsert(t);
        return Task.FromResult(Map(t));
    }

    public Task<TodoItemDto?> PatchAsync(Guid id, PatchTodoRequestDto body, CancellationToken ct)
    {
        var t = _todos.GetById(id);
        if (t is null)
            return Task.FromResult<TodoItemDto?>(null);
        if (body.Status.HasValue)
            t.Status = body.Status.Value;
        if (!string.IsNullOrWhiteSpace(body.Title))
            t.Title = body.Title!;
        if (body.DueDate.HasValue)
            t.DueDate = body.DueDate;
        t.UpdatedAt = DateTimeOffset.UtcNow;
        _todos.Upsert(t);
        return Task.FromResult<TodoItemDto?>(Map(t));
    }

    public async Task<TodoItemDto> FromActionItemAsync(TodoFromActionItemRequestDto body, CancellationToken ct)
    {
        if (_meetings.GetById(body.MeetingId) is null)
            throw new KeyNotFoundException("Meeting not found.");
        var dto = await _meetingsApi.ConvertActionItemToTodoAsync(body.MeetingId, body.ActionItemId, body.UserId, body.Type, ct).ConfigureAwait(false);
        return dto;
    }

    private static TodoItemDto Map(TodoItem t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        Type = t.Type,
        DueDate = t.DueDate,
        Status = t.Status,
        SourceMeetingId = t.SourceMeetingId,
        SourceActionItemId = t.SourceActionItemId
    };
}
