using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryWebhookEventRepository : IWebhookEventRepository
{
    private readonly ConcurrentDictionary<Guid, WebhookEvent> _store = new();

    public void Add(WebhookEvent webhookEvent) => _store[webhookEvent.Id] = webhookEvent;

    public IReadOnlyList<WebhookEvent> GetRecent(int take) =>
        _store.Values.OrderByDescending(w => w.ReceivedAt).Take(take).ToList();

    public IReadOnlyList<WebhookEvent> GetRecentContaining(string substring, int take) =>
        _store.Values
            .Where(w => w.RawPayload.Contains(substring, StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(w => w.ReceivedAt)
            .Take(take)
            .ToList();
}
