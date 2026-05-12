using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Enums;
using IntelliMeet.Backend.Options;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("api/webhooks/stripe")]
[AllowAnonymous]
public sealed class StripeWebhookController : ControllerBase
{
    private readonly IUserRepository _users;
    private readonly StripeOptions _stripe;
    private readonly ILogger<StripeWebhookController> _logger;

    public StripeWebhookController(
        IUserRepository users,
        IOptions<StripeOptions> stripe,
        ILogger<StripeWebhookController> logger)
    {
        _users = users;
        _stripe = stripe.Value;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Handle(CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_stripe.WebhookSecret))
            return BadRequest("Webhook not configured.");

        StripeConfiguration.ApiKey = _stripe.SecretKey;
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync(ct).ConfigureAwait(false);
        try
        {
            var stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], _stripe.WebhookSecret);
            switch (stripeEvent.Type)
            {
                case "customer.subscription.created":
                    if (stripeEvent.Data.Object is Subscription s0)
                        await ApplySubscriptionAsync(s0, resetUsage: true, ct).ConfigureAwait(false);
                    break;
                case "customer.subscription.updated":
                    if (stripeEvent.Data.Object is Subscription s1)
                        await ApplySubscriptionAsync(s1, resetUsage: false, ct).ConfigureAwait(false);
                    break;
                case "invoice.payment_succeeded":
                    if (stripeEvent.Data.Object is Invoice inv && !string.IsNullOrEmpty(inv.CustomerId))
                        ResetUsageForCustomer(inv.CustomerId);
                    break;
                default:
                    break;
            }
        }
        catch (StripeException ex)
        {
            _logger.LogWarning(ex, "Stripe webhook signature failed");
            return BadRequest();
        }

        return Ok();
    }

    private Task ApplySubscriptionAsync(Subscription sub, bool resetUsage, CancellationToken ct)
    {
        var user = _users.GetAll().FirstOrDefault(u => u.StripeCustomerId == sub.CustomerId);
        if (user is null)
        {
            _logger.LogWarning("No user for Stripe customer {Customer}", sub.CustomerId);
            return Task.CompletedTask;
        }

        var tracked = _users.GetTrackedById(user.Id);
        if (tracked is null) return Task.CompletedTask;

        tracked.StripeSubscriptionId = sub.Id;
        var priceId = sub.Items?.Data?.FirstOrDefault()?.Price?.Id;
        tracked.CurrentPlan = MapPriceToTier(priceId);
        tracked.SubscriptionStatus = sub.Status switch
        {
            "active" or "trialing" => BillingSubscriptionStatus.Active,
            "canceled" => BillingSubscriptionStatus.Cancelled,
            "past_due" => BillingSubscriptionStatus.PastDue,
            _ => BillingSubscriptionStatus.None
        };
        if (sub.CurrentPeriodEnd != default)
            tracked.PlanEndDateUtc = new DateTimeOffset(DateTime.SpecifyKind(sub.CurrentPeriodEnd, DateTimeKind.Utc));
        if (resetUsage && (sub.Status == "active" || sub.Status == "trialing"))
        {
            tracked.MeetingsThisMonth = 0;
            tracked.ChatMessagesThisMonth = 0;
        }
        _users.Upsert(tracked);
        return Task.CompletedTask;
    }

    private BillingSubscriptionTier MapPriceToTier(string? priceId)
    {
        if (string.IsNullOrEmpty(priceId)) return BillingSubscriptionTier.None;
        if (string.Equals(priceId, _stripe.PriceIdStarter, StringComparison.Ordinal))
            return BillingSubscriptionTier.Starter;
        if (string.Equals(priceId, _stripe.PriceIdPro, StringComparison.Ordinal))
            return BillingSubscriptionTier.Pro;
        // Enterprise plan in the product UI maps to the Premium Stripe price id (see appsettings Stripe:PriceIdPremium).
        if (string.Equals(priceId, _stripe.PriceIdPremium, StringComparison.Ordinal))
            return BillingSubscriptionTier.Enterprise;
        return BillingSubscriptionTier.None;
    }

    private void ResetUsageForCustomer(string customerId)
    {
        var user = _users.GetAll().FirstOrDefault(u => u.StripeCustomerId == customerId);
        var tracked = user is null ? null : _users.GetTrackedById(user.Id);
        if (tracked is null) return;
        tracked.MeetingsThisMonth = 0;
        tracked.ChatMessagesThisMonth = 0;
        _users.Upsert(tracked);
    }
}
