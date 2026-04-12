using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IIntegrationCredentialsRepository
{
    IntegrationCredentials? GetById(Guid id);
    void Upsert(IntegrationCredentials credentials);
}
