using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IActionItemRepository
{
    IReadOnlyList<ActionItem> GetByMeetingId(Guid meetingId);
    ActionItem? GetById(Guid id);
    void Upsert(ActionItem item);
}
