using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Domain.Enums;
using IntelliMeet.Backend.Infrastructure.Api;
using IntelliMeet.Backend.Options;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("api/billing")]
public sealed class BillingController : ControllerBase
{
    private readonly IUserRepository _users;
    private readonly StripeOptions _stripe;
    private readonly PlanLimitsOptions _limits;
    private readonly IOptions<IntegrationsOptions> _integrationOptions;

    public BillingController(
        IUserRepository users,
        IOptions<StripeOptions> stripe,
        IOptions<PlanLimitsOptions> limits,
        IOptions<IntegrationsOptions> integrationOptions)
    {
        _users = users;
        _stripe = stripe.Value;
        _limits = limits.Value;
        _integrationOptions = integrationOptions;
    }

    /// <summary>Stripe price ids for paid tiers (safe to expose to the SPA).</summary>
    [HttpGet("plan-prices")]
    [AllowAnonymous]
    public ActionResult<BillingPlanPricesDto> PlanPrices() =>
        Ok(new BillingPlanPricesDto
        {
            PriceIdStarter = _stripe.PriceIdStarter.Trim(),
            PriceIdPro = _stripe.PriceIdPro.Trim(),
            PriceIdPremium = _stripe.PriceIdPremium.Trim()
        });

    [HttpPost("create-checkout-session")]
    public async Task<ActionResult<CreateCheckoutSessionResponseDto>> CreateCheckout(
        [FromBody] CreateCheckoutSessionRequestDto body,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.PriceId))
            return BadRequest("priceId required.");
        if (string.IsNullOrWhiteSpace(_stripe.SecretKey))
            return BadRequest("Stripe is not configured (Stripe:SecretKey).");

        var pid = body.PriceId.Trim();
        var allowedStarter = _stripe.PriceIdStarter.Trim();
        var allowedPro = _stripe.PriceIdPro.Trim();
        var allowedEnt = _stripe.PriceIdPremium.Trim();
        if (string.IsNullOrEmpty(allowedStarter) && string.IsNullOrEmpty(allowedPro) && string.IsNullOrEmpty(allowedEnt))
            return BadRequest("Stripe price ids are not configured.");
        if (!string.Equals(pid, allowedStarter, StringComparison.Ordinal) &&
            !string.Equals(pid, allowedPro, StringComparison.Ordinal) &&
            !string.Equals(pid, allowedEnt, StringComparison.Ordinal))
            return BadRequest("Unknown priceId for checkout.");

        StripeConfiguration.ApiKey = _stripe.SecretKey;
        var userId = IntegrationUserResolver.ResolveUserId(Request, _integrationOptions);
        var user = _users.GetTrackedById(userId);
        if (user is null)
            return NotFound("User not found.");

        if (string.IsNullOrWhiteSpace(user.StripeCustomerId))
        {
            var cust = await new CustomerService().CreateAsync(new CustomerCreateOptions
            {
                Email = user.Email,
                Name = user.DisplayName,
                Metadata = new Dictionary<string, string> { ["intellimeet_user_id"] = user.Id.ToString() }
            }, cancellationToken: ct).ConfigureAwait(false);
            user.StripeCustomerId = cust.Id;
            _users.Upsert(user);
        }

        var clerkId = user.ExternalUserId ?? user.Id.ToString("D");
        var options = new SessionCreateOptions
        {
            Mode = "subscription",
            Customer = user.StripeCustomerId,
            LineItems = new List<SessionLineItemOptions>
            {
                new() { Price = pid, Quantity = 1 }
            },
            SuccessUrl = EnsureSessionIdPlaceholder(_stripe.SuccessUrl),
            CancelUrl = _stripe.CancelUrl,
            Metadata = new Dictionary<string, string> { ["clerkUserId"] = clerkId, ["userId"] = user.Id.ToString("D") }
        };
        var session = await new SessionService().CreateAsync(options, cancellationToken: ct).ConfigureAwait(false);
        if (string.IsNullOrWhiteSpace(session.Url))
            return BadRequest("Stripe did not return a session URL.");
        return Ok(new CreateCheckoutSessionResponseDto { SessionUrl = session.Url });
    }

    [HttpPost("confirm-checkout-session")]
    public async Task<ActionResult<object>> ConfirmCheckoutSession(
        [FromBody] ConfirmCheckoutSessionRequestDto body,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.SessionId))
            return BadRequest("sessionId required.");
        if (string.IsNullOrWhiteSpace(_stripe.SecretKey))
            return BadRequest("Stripe is not configured (Stripe:SecretKey).");

        StripeConfiguration.ApiKey = _stripe.SecretKey;
        var userId = IntegrationUserResolver.ResolveUserId(Request, _integrationOptions);
        var user = _users.GetTrackedById(userId);
        if (user is null)
            return NotFound("User not found.");

        var session = await new SessionService().GetAsync(body.SessionId.Trim(), cancellationToken: ct).ConfigureAwait(false);
        if (session is null)
            return BadRequest("Session not found.");

        // Accept match via explicit metadata first (most stable), then by Stripe customer id.
        var sessionUserId = session.Metadata != null && session.Metadata.TryGetValue("userId", out var mid) ? mid : null;
        var matchesByMetadata = !string.IsNullOrWhiteSpace(sessionUserId) &&
                                string.Equals(sessionUserId, user.Id.ToString("D"), StringComparison.OrdinalIgnoreCase);
        var matchesByCustomer = !string.IsNullOrWhiteSpace(session.CustomerId) &&
                                !string.IsNullOrWhiteSpace(user.StripeCustomerId) &&
                                string.Equals(session.CustomerId, user.StripeCustomerId, StringComparison.Ordinal);

        if (!matchesByMetadata && !matchesByCustomer)
            return BadRequest("Session does not match current user.");

        // Backfill Stripe customer id if missing on our side.
        if (string.IsNullOrWhiteSpace(user.StripeCustomerId) && !string.IsNullOrWhiteSpace(session.CustomerId))
            user.StripeCustomerId = session.CustomerId;
        if (!string.Equals(session.PaymentStatus, "paid", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(session.Status, "complete", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Checkout session is not completed.");

        if (string.IsNullOrWhiteSpace(session.SubscriptionId))
            return BadRequest("No subscription on checkout session.");

        var sub = await new SubscriptionService().GetAsync(session.SubscriptionId, cancellationToken: ct).ConfigureAwait(false);
        user.StripeSubscriptionId = sub.Id;
        var priceId = sub.Items?.Data?.FirstOrDefault()?.Price?.Id;
        user.CurrentPlan = MapPriceToTier(priceId);
        user.SubscriptionStatus = sub.Status switch
        {
            "active" or "trialing" => BillingSubscriptionStatus.Active,
            "canceled" => BillingSubscriptionStatus.Cancelled,
            "past_due" => BillingSubscriptionStatus.PastDue,
            _ => BillingSubscriptionStatus.None
        };
        user.MeetingsThisMonth = 0;
        user.ChatMessagesThisMonth = 0;
        _users.Upsert(user);
        return Ok(new { ok = true });
    }

    [HttpGet("usage-summary")]
    public ActionResult<UsageSummaryDto> UsageSummary()
    {
        var userId = IntegrationUserResolver.ResolveUserId(Request, _integrationOptions);
        var user = _users.GetById(userId);
        if (user is null)
            return NotFound();
        var (mLim, cLim) = _limits.Resolve(user.CurrentPlan);
        return Ok(new UsageSummaryDto
        {
            CurrentPlan = user.CurrentPlan.ToString(),
            SubscriptionStatus = user.SubscriptionStatus.ToString(),
            MeetingsThisMonth = user.MeetingsThisMonth,
            MeetingsLimit = mLim,
            ChatThisMonth = user.ChatMessagesThisMonth,
            ChatLimit = cLim
        });
    }

    private string EnsureSessionIdPlaceholder(string successUrl)
    {
        const string token = "{CHECKOUT_SESSION_ID}";
        if (successUrl.Contains(token, StringComparison.Ordinal))
            return successUrl;
        var sep = successUrl.Contains('?') ? "&" : "?";
        return $"{successUrl}{sep}session_id={token}";
    }

    private BillingSubscriptionTier MapPriceToTier(string? priceId)
    {
        if (string.IsNullOrEmpty(priceId)) return BillingSubscriptionTier.None;
        if (string.Equals(priceId, _stripe.PriceIdStarter, StringComparison.Ordinal))
            return BillingSubscriptionTier.Starter;
        if (string.Equals(priceId, _stripe.PriceIdPro, StringComparison.Ordinal))
            return BillingSubscriptionTier.Pro;
        if (string.Equals(priceId, _stripe.PriceIdPremium, StringComparison.Ordinal))
            return BillingSubscriptionTier.Enterprise;
        return BillingSubscriptionTier.None;
    }
}
