using System.Text.Json;
using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.Services;

public static class WebhookEventParser
{
    public static WebhookEventType ParseType(string json)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            if (root.TryGetProperty("type", out var t))
                return Map(t.GetString());
            if (root.TryGetProperty("event", out var e))
                return Map(e.GetString());
            if (root.TryGetProperty("event_type", out var et))
                return Map(et.GetString());
        }
        catch
        {
            /* ignore */
        }
        return WebhookEventType.Unknown;
    }

    private static WebhookEventType Map(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return WebhookEventType.Unknown;
        return name.ToLowerInvariant() switch
        {
            "bot.status_change" => WebhookEventType.BotStatusChange,
            "bot.completed" => WebhookEventType.BotCompleted,
            "bot.failed" => WebhookEventType.BotFailed,
            "calendar.connection_created" => WebhookEventType.CalendarConnectionCreated,
            "calendar.connection_updated" => WebhookEventType.CalendarConnectionUpdated,
            "calendar.connection_deleted" => WebhookEventType.CalendarConnectionDeleted,
            "calendar.connection_error" => WebhookEventType.CalendarConnectionError,
            "calendar.events_synced" => WebhookEventType.CalendarEventsSynced,
            "calendar.event_created" => WebhookEventType.CalendarEventCreated,
            "calendar.event_updated" => WebhookEventType.CalendarEventUpdated,
            "calendar.event_cancelled" => WebhookEventType.CalendarEventCancelled,
            "transcription.complete" or "bot.transcription_complete" => WebhookEventType.TranscriptionComplete,
            _ => WebhookEventType.Unknown
        };
    }

    public static string? TryGetBotId(string json)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            if (TryBotId(doc.RootElement, out var id))
                return id;
        }
        catch
        {
            /* ignore */
        }
        return null;
    }

    private static bool TryBotId(JsonElement el, out string? botId)
    {
        botId = null;
        if (el.TryGetProperty("data", out var data))
        {
            if (data.TryGetProperty("bot_id", out var b))
            {
                botId = b.GetString();
                return botId is not null;
            }
            if (data.TryGetProperty("botId", out var b2))
            {
                botId = b2.GetString();
                return botId is not null;
            }
        }
        if (el.TryGetProperty("bot_id", out var rootB))
        {
            botId = rootB.GetString();
            return botId is not null;
        }
        return false;
    }
}
