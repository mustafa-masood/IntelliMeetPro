namespace IntelliMeet.Backend.Domain.Entities;

public sealed class MeetingSummary
{
    public Guid Id { get; set; }
    public Guid MeetingId { get; set; }
    public string ShortSummary { get; set; } = string.Empty;
    public IReadOnlyList<string> StructuredSections { get; set; } = Array.Empty<string>();

    public IReadOnlyList<string> Decisions { get; set; } = Array.Empty<string>();

    public IReadOnlyList<string> Risks { get; set; } = Array.Empty<string>();

    public DateTimeOffset UpdatedAt { get; set; }
}
