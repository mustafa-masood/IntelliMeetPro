using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IActionItemRepository
{
    IReadOnlyList<ActionItem> GetByMeetingId(Guid meetingId);
    ActionItem? GetById(Guid id);
    void Upsert(ActionItem item);

    /// <summary>Removes action items for a meeting with the given <paramref name="source"/> (e.g. <c>ollama</c>).</summary>
    void RemoveByMeetingIdAndSource(Guid meetingId, string source);
}
