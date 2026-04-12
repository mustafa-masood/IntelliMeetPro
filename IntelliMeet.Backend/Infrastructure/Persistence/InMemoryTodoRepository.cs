using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryTodoRepository : ITodoRepository
{
    private readonly ConcurrentDictionary<Guid, TodoItem> _store = new();

    public IReadOnlyList<TodoItem> GetAll(Guid? userId)
    {
        IEnumerable<TodoItem> q = _store.Values;
        if (userId.HasValue)
            q = q.Where(t => t.UserId == null || t.UserId == userId);
        return q.OrderByDescending(t => t.CreatedAt).ToList();
    }

    public TodoItem? GetById(Guid id) => _store.GetValueOrDefault(id);

    public void Upsert(TodoItem item) => _store[item.Id] = item;
}
