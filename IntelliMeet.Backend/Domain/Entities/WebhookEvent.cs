using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Domain.Entities;

public sealed class WebhookEvent
{
    public Guid Id { get; set; }
    public WebhookEventType EventType { get; set; }
    public string RawPayload { get; set; } = string.Empty;
    public string? ExternalMessageId { get; set; }
    public bool Processed { get; set; }
    public string? ProcessingNote { get; set; }
    public DateTimeOffset ReceivedAt { get; set; }
}
