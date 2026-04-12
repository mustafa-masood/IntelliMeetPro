using IntelliMeet.Backend.Application.DTOs;

namespace IntelliMeet.Backend.Application.Services;

public interface ITodoWorkflowService
{
    Task<IReadOnlyList<TodoItemDto>> ListAsync(Guid? userId, CancellationToken ct);
    Task<TodoItemDto> CreateAsync(CreateTodoRequestDto body, CancellationToken ct);
    Task<TodoItemDto?> PatchAsync(Guid id, PatchTodoRequestDto body, CancellationToken ct);
    Task<TodoItemDto> FromActionItemAsync(TodoFromActionItemRequestDto body, CancellationToken ct);
}
