using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IMeetingBotRepository
{
    /// <summary>All bots for the given meetings (one DB round-trip for list views).</summary>
    IReadOnlyList<MeetingBot> GetBotsForMeetingIds(IReadOnlyCollection<Guid> meetingIds);

    IReadOnlyList<MeetingBot> GetByMeetingId(Guid meetingId);
    MeetingBot? GetById(Guid id);
    MeetingBot? GetByExternalBotId(string externalBotId);
    void Upsert(MeetingBot bot);
}
