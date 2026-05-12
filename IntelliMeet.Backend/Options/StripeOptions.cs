namespace IntelliMeet.Backend.Options;

public sealed class StripeOptions
{
    public const string SectionName = "Stripe";

    public string PublishableKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;

    /// <summary>Price ids from Stripe dashboard (recurring).</summary>
    public string PriceIdStarter { get; set; } = string.Empty;
    public string PriceIdPro { get; set; } = string.Empty;
    public string PriceIdPremium { get; set; } = string.Empty;

    public string SuccessUrl { get; set; } = "http://localhost:5173/billing/success";
    public string CancelUrl { get; set; } = "http://localhost:5173/billing/cancel";
}
