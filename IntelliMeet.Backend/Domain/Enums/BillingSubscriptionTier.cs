namespace IntelliMeet.Backend.Domain.Enums;

public enum BillingSubscriptionTier
{
    None = 0,
    Starter = 1,
    Pro = 2,
    Premium = 3,
    Enterprise = 4,
    /// <summary>Free tier after onboarding (no Stripe).</summary>
    Basic = 5
}
