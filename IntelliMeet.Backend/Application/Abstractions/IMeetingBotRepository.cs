using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IMeetingBotRepository
{
    IReadOnlyList<MeetingBot> GetByMeetingId(Guid meetingId);
    MeetingBot? GetById(Guid id);
    MeetingBot? GetByExternalBotId(string externalBotId);
    void Upsert(MeetingBot bot);
}
