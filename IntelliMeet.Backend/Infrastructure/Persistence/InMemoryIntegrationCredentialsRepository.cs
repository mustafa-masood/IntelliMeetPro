using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryIntegrationCredentialsRepository : IIntegrationCredentialsRepository
{
    private readonly ConcurrentDictionary<Guid, IntegrationCredentials> _store = new();

    public IntegrationCredentials? GetById(Guid id) => _store.GetValueOrDefault(id);

    public void Upsert(IntegrationCredentials credentials) => _store[credentials.Id] = credentials;
}
