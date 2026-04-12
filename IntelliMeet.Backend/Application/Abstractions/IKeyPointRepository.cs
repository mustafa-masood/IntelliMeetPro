using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IKeyPointRepository
{
    IReadOnlyList<KeyPoint> GetByMeetingId(Guid meetingId);
    void ReplaceForMeeting(Guid meetingId, IReadOnlyList<KeyPoint> keyPoints);
}
