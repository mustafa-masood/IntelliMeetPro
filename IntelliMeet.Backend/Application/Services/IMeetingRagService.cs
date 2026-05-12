using IntelliMeet.Backend.Application.Models;

namespace IntelliMeet.Backend.Application.Services;

public interface IMeetingRagService
{
    Task<MeetingRagChatResult> AskMeetingAsync(Guid meetingId, string question, CancellationToken ct);
    Task<MeetingRagChatResult> AskAllMeetingsAsync(string question, CancellationToken ct);
}
