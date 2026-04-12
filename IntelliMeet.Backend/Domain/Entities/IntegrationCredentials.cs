using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Domain.Entities;

/// <summary>OAuth application credentials (service-level). Replace with secure secret storage when persisting.</summary>
public sealed class IntegrationCredentials
{
    public Guid Id { get; set; }
    public CalendarProvider Provider { get; set; }
    public string OAuthClientId { get; set; } = string.Empty;
    public string OAuthClientSecret { get; set; } = string.Empty;
    /// <summary>Microsoft Entra tenant id, when applicable.</summary>
    public string? OAuthTenantId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
