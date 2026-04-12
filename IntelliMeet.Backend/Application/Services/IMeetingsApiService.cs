using IntelliMeet.Backend.Application.DTOs;

namespace IntelliMeet.Backend.Application.Services;

public interface IMeetingsApiService
{
    Task<IReadOnlyList<MeetingListItemDto>> ListAsync(CancellationToken ct);
    Task<MeetingDetailDto?> GetDetailAsync(Guid id, CancellationToken ct);
    Task<TranscriptDto?> GetTranscriptAsync(Guid id, CancellationToken ct);
    Task<MeetingSummaryDto?> GetSummaryAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<ActionItemDto>> GetActionItemsAsync(Guid id, CancellationToken ct);
    Task<TodoItemDto> ConvertActionItemToTodoAsync(Guid meetingId, Guid actionItemId, Guid? userId, string? type, CancellationToken ct);
    Task<ActionItemDto> AssignTaskAsync(Guid meetingId, AssignTaskRequestDto body, CancellationToken ct);
}
