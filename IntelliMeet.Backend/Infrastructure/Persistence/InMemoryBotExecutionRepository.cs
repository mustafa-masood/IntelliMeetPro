using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryBotExecutionRepository : IBotExecutionRepository
{
    private readonly ConcurrentDictionary<Guid, BotExecution> _store = new();

    public void Add(BotExecution execution) => _store[execution.Id] = execution;

    public IReadOnlyList<BotExecution> GetByMeetingBotId(Guid meetingBotId) =>
        _store.Values.Where(e => e.MeetingBotId == meetingBotId).OrderBy(e => e.AtUtc).ToList();
}
