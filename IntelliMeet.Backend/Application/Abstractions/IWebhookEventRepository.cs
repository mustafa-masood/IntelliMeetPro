using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IWebhookEventRepository
{
    void Add(WebhookEvent webhookEvent);
    IReadOnlyList<WebhookEvent> GetRecent(int take);
    IReadOnlyList<WebhookEvent> GetRecentContaining(string substring, int take);
}
