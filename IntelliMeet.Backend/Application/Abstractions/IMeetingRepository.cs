using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IMeetingRepository
{
    IReadOnlyList<Meeting> GetAll();
    Meeting? GetById(Guid id);
    void Upsert(Meeting meeting);
    IReadOnlyList<Meeting> GetUpcoming(DateTimeOffset now, int take);
}
