using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Domain.Entities;

public sealed class Transcript
{
    public Guid Id { get; set; }
    public Guid MeetingId { get; set; }
    public TranscriptStatus Status { get; set; }
    public string? RawText { get; set; }
    public string? ExternalTranscriptionUrl { get; set; }
    public string? ExternalRawTranscriptionUrl { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
