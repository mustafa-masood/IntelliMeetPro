using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Domain.Entities;

public sealed class MeetingBot
{
    public Guid Id { get; set; }
    public Guid MeetingId { get; set; }
    /// <summary>Meeting BaaS bot id (string UUID).</summary>
    public string ExternalBotId { get; set; } = string.Empty;
    public BotOperationalStatus Status { get; set; }
    public TranscriptStatus TranscriptionStatus { get; set; }
    public bool IsScheduled { get; set; }
    public DateTimeOffset? JoinAtUtc { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
