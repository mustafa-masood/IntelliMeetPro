namespace IntelliMeet.Backend.Infrastructure.MeetingBaas;

public sealed class MeetingBaasOptions
{
    public const string SectionName = "MeetingBaas";

    /// <summary>Base URL without trailing slash, e.g. https://api.meetingbaas.com</summary>
    public string BaseUrl { get; set; } = "https://api.meetingbaas.com";

    /// <summary>Set via environment <c>MeetingBaas__ApiKey</c> or user secrets — never commit real keys.</summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>SVIX signing secret from Meeting BaaS webhook settings; optional but recommended for production.</summary>
    public string? WebhookSigningSecret { get; set; }

    /// <summary>Shown in Meet/Zoom/Teams when <c>bot_name</c> is omitted on join/schedule requests.</summary>
    public string DefaultBotName { get; set; } = "IntelliMeet Pro Notetaker";

    /// <summary>Optional HTTPS URL to a PNG/JPEG/WebP for Meeting BaaS <c>bot_image</c> (must be reachable from Meeting BaaS servers, not localhost).</summary>
    public string? BotImageUrl { get; set; }

    /// <summary>Optional chat message posted when the bot joins (Meeting BaaS <c>entry_message</c>).</summary>
    public string? BotEntryMessage { get; set; }
}
