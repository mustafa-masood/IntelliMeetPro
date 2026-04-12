namespace IntelliMeet.Backend.Domain.Entities;

public sealed class TranscriptSegment
{
    public Guid Id { get; set; }
    public Guid TranscriptId { get; set; }
    public string Speaker { get; set; } = string.Empty;
    public double StartSeconds { get; set; }
    public double EndSeconds { get; set; }
    public string Text { get; set; } = string.Empty;
}
