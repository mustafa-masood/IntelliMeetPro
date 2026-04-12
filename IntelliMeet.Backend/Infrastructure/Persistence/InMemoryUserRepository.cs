using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryUserRepository : IUserRepository
{
    private readonly ConcurrentDictionary<Guid, User> _store = new();

    public IReadOnlyList<User> GetAll() => _store.Values.OrderBy(u => u.Email).ToList();

    public User? GetById(Guid id) => _store.GetValueOrDefault(id);

    public void Upsert(User user) => _store[user.Id] = user;
}
