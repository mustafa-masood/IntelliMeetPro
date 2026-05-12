using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IUserRepository
{
    IReadOnlyList<User> GetAll();
    User? GetById(Guid id);
    User? GetByEmail(string email);
    User? GetByExternalUserId(string externalUserId);
    /// <summary>Tracked entity for token updates (avoid AsNoTracking).</summary>
    User? GetTrackedById(Guid id);
    IReadOnlyList<User> GetUsersWithGoogleCalendarConnected();
    void Upsert(User user);
}
