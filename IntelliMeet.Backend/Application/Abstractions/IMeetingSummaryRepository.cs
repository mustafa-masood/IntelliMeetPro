using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IMeetingSummaryRepository
{
    MeetingSummary? GetByMeetingId(Guid meetingId);
    void Upsert(MeetingSummary summary);
}
