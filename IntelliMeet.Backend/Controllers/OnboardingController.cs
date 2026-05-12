using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Domain.Enums;
using IntelliMeet.Backend.Infrastructure.Api;
using IntelliMeet.Backend.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("api/onboarding")]
public sealed class OnboardingController : ControllerBase
{
    private readonly IUserRepository _users;
    private readonly IOptions<IntegrationsOptions> _integrationOptions;
    private readonly StripeOptions _stripe;
    private readonly ICurrentUserContext _currentUser;

    public OnboardingController(
        IUserRepository users,
        IOptions<IntegrationsOptions> integrationOptions,
        IOptions<StripeOptions> stripe,
        ICurrentUserContext currentUser)
    {
        _users = users;
        _integrationOptions = integrationOptions;
        _stripe = stripe.Value;
        _currentUser = currentUser;
    }

    /// <summary>Whether the signed-in user must pick a plan before using the product.</summary>
    [HttpGet("me")]
    public async Task<ActionResult<OnboardingMeDto>> Me(CancellationToken ct)
    {
        var userId = _currentUser.IsResolved ? _currentUser.UserId : IntegrationUserResolver.ResolveUserId(Request, _integrationOptions);
        var user = _users.GetTrackedById(userId);
        if (user is null)
            return NotFound();

        // If Stripe checkout already completed but webhook is delayed/missed,
        // pull the latest subscription status on-demand so paid users are not forced to subscribe again.
        if ((user.SubscriptionStatus != BillingSubscriptionStatus.Active || user.CurrentPlan == BillingSubscriptionTier.None) &&
            !string.IsNullOrWhiteSpace(user.StripeCustomerId) &&
            !string.IsNullOrWhiteSpace(_stripe.SecretKey))
        {
            try
            {
                StripeConfiguration.ApiKey = _stripe.SecretKey;
                var list = await new SubscriptionService().ListAsync(new SubscriptionListOptions
                {
                    Customer = user.StripeCustomerId,
                    Limit = 5,
                    Status = "all"
                }, cancellationToken: ct).ConfigureAwait(false);

                var sub = list.Data
                    .OrderByDescending(s => s.Created)
                    .FirstOrDefault();
                if (sub is not null)
                {
                    user.StripeSubscriptionId = sub.Id;
                    user.SubscriptionStatus = sub.Status switch
                    {
                        "active" or "trialing" => BillingSubscriptionStatus.Active,
                        "canceled" => BillingSubscriptionStatus.Cancelled,
                        "past_due" => BillingSubscriptionStatus.PastDue,
                        _ => BillingSubscriptionStatus.None
                    };
                    var priceId = sub.Items?.Data?.FirstOrDefault()?.Price?.Id;
                    user.CurrentPlan = MapPriceToTier(priceId);
                    if (sub.CurrentPeriodEnd != default)
                        user.PlanEndDateUtc = new DateTimeOffset(DateTime.SpecifyKind(sub.CurrentPeriodEnd, DateTimeKind.Utc));
                    _users.Upsert(user);
                }
            }
            catch
            {
                // Do not fail onboarding if Stripe is temporarily unavailable/misconfigured.
                // Webhooks and /billing/success confirmation can still finalize plan status.
            }
        }

        var needs = user.SubscriptionStatus != BillingSubscriptionStatus.Active
                    || user.CurrentPlan == BillingSubscriptionTier.None;
        return Ok(new OnboardingMeDto
        {
            UserId = user.Id,
            NeedsPlanSelection = needs,
            CurrentPlan = user.CurrentPlan.ToString(),
            SubscriptionStatus = user.SubscriptionStatus.ToString(),
            WorkspaceId = user.WorkspaceId?.ToString("D"),
            PlanEndDateUtc = user.PlanEndDateUtc,
            Role = _currentUser.IsResolved ? _currentUser.Role.ToString() : null,
            TeamId = _currentUser.IsResolved ? _currentUser.TeamId : null
        });
    }

    /// <summary>Activate the free Basic plan (no Stripe).</summary>
    [HttpPost("set-basic-plan")]
    public IActionResult SetBasicPlan()
    {
        var userId = IntegrationUserResolver.ResolveUserId(Request, _integrationOptions);
        var user = _users.GetTrackedById(userId);
        if (user is null)
            return NotFound();

        user.CurrentPlan = BillingSubscriptionTier.Basic;
        user.SubscriptionStatus = BillingSubscriptionStatus.Active;
        user.MeetingsThisMonth = 0;
        user.ChatMessagesThisMonth = 0;
        _users.Upsert(user);
        return Ok(new { ok = true });
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
