using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryMeetingBotRepository : IMeetingBotRepository
{
    private readonly ConcurrentDictionary<Guid, MeetingBot> _store = new();

    public IReadOnlyList<MeetingBot> GetByMeetingId(Guid meetingId) =>
        _store.Values.Where(b => b.MeetingId == meetingId).ToList();

    public MeetingBot? GetById(Guid id) => _store.GetValueOrDefault(id);

    public MeetingBot? GetByExternalBotId(string externalBotId) =>
        _store.Values.FirstOrDefault(b => b.ExternalBotId == externalBotId);

    public void Upsert(MeetingBot bot) => _store[bot.Id] = bot;
}
