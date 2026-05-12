using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryUserRepository : IUserRepository
{
    private readonly ConcurrentDictionary<Guid, User> _store = new();

    public IReadOnlyList<User> GetAll() => _store.Values.OrderBy(u => u.Email).ToList();

    public User? GetById(Guid id) => _store.GetValueOrDefault(id);

    public User? GetByEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return null;
        var e = email.Trim();
        return _store.Values.FirstOrDefault(u => string.Equals(u.Email, e, StringComparison.OrdinalIgnoreCase));
    }

    public User? GetByExternalUserId(string externalUserId) =>
        string.IsNullOrWhiteSpace(externalUserId)
            ? null
            : _store.Values.FirstOrDefault(u => u.ExternalUserId == externalUserId);

    public User? GetTrackedById(Guid id) => GetById(id);

    public IReadOnlyList<User> GetUsersWithGoogleCalendarConnected() =>
        _store.Values
            .Where(u => u.CalendarConnected && !string.IsNullOrEmpty(u.GoogleAccessToken))
            .ToList();

    public void Upsert(User user) => _store[user.Id] = user;
}
