namespace IntelliMeet.Backend.Domain.Entities;

/// <summary>Audit trail of bot phase transitions (webhook-driven or API-driven).</summary>
public sealed class BotExecution
{
    public Guid Id { get; set; }
    public Guid MeetingBotId { get; set; }
    public string Phase { get; set; } = string.Empty;
    public string? Detail { get; set; }
    public DateTimeOffset AtUtc { get; set; }
}
