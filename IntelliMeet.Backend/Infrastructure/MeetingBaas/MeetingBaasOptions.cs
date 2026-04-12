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
}
