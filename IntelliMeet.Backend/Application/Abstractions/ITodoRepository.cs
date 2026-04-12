using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface ITodoRepository
{
    IReadOnlyList<TodoItem> GetAll(Guid? userId);
    TodoItem? GetById(Guid id);
    void Upsert(TodoItem item);
}
