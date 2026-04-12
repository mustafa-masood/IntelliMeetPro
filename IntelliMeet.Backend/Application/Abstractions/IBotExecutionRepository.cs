using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IBotExecutionRepository
{
    void Add(BotExecution execution);
    IReadOnlyList<BotExecution> GetByMeetingBotId(Guid meetingBotId);
}
