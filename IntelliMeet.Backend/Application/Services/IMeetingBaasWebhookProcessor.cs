namespace IntelliMeet.Backend.Application.Services;

public interface IMeetingBaasWebhookProcessor
{
    Task<WebhookAcceptResult> ProcessAsync(string rawPayload, string? svixId, CancellationToken ct);
}

public sealed record WebhookAcceptResult(bool Accepted, string? Message);
