using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IUserRepository
{
    IReadOnlyList<User> GetAll();
    User? GetById(Guid id);
    void Upsert(User user);
}
