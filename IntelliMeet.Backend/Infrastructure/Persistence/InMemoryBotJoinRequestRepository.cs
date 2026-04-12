using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryBotJoinRequestRepository : IBotJoinRequestRepository
{
    private readonly ConcurrentDictionary<Guid, BotJoinRequest> _store = new();

    public void Add(BotJoinRequest request) => _store[request.Id] = request;

    public BotJoinRequest? GetById(Guid id) => _store.GetValueOrDefault(id);
}
