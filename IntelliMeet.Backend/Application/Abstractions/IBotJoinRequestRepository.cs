using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IBotJoinRequestRepository
{
    void Add(BotJoinRequest request);
    BotJoinRequest? GetById(Guid id);
}
