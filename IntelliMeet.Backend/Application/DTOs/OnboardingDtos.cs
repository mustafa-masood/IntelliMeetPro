namespace IntelliMeet.Backend.Application.DTOs;

public sealed class OnboardingMeDto
{
    /// <summary>Internal IntelliMeet user id (for OAuth redirects / legacy query flows).</summary>
    public Guid UserId { get; init; }

    public bool NeedsPlanSelection { get; init; }
    public string CurrentPlan { get; init; } = string.Empty;
    public string SubscriptionStatus { get; init; } = string.Empty;
    public string? WorkspaceId { get; init; }
    public DateTimeOffset? PlanEndDateUtc { get; init; }
    public string? Role { get; init; }
    public Guid? TeamId { get; init; }
}

public sealed class BillingPlanPricesDto
{
    public string PriceIdStarter { get; init; } = string.Empty;
    public string PriceIdPro { get; init; } = string.Empty;
    public string PriceIdPremium { get; init; } = string.Empty;
}
