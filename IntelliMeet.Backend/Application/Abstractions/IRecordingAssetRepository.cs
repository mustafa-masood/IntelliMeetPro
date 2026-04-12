using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IRecordingAssetRepository
{
    IReadOnlyList<RecordingAsset> GetByMeetingId(Guid meetingId);
    void Upsert(RecordingAsset asset);
    void RemoveForMeeting(Guid meetingId);
}
