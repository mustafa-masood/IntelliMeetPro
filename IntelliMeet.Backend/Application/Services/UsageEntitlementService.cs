using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Application.Services;

public sealed class UsageEntitlementService : IUsageEntitlementService
{
    private readonly PlanLimitsOptions _limits;

    public UsageEntitlementService(IOptions<PlanLimitsOptions> limits) => _limits = limits.Value;

    public (bool ok, string? code, string? message) CanRunMeetingAnalysis(User organizer)
    {
        if (organizer.SubscriptionStatus == BillingSubscriptionStatus.Inactive)
            return (false, "SUBSCRIPTION_INACTIVE", "Subscription inactive. Upgrade to continue.");
        var (maxM, _) = _limits.Resolve(organizer.CurrentPlan);
        if (organizer.MeetingsThisMonth >= maxM)
            return (false, "PLAN_LIMIT_EXCEEDED", $"Meeting analysis limit reached ({maxM}/month).");
        return (true, null, null);
    }

    public void RecordMeetingAnalysis(User organizer)
    {
        organizer.MeetingsThisMonth++;
    }

    public (bool ok, string? code, string? message) CanRunChat(User user)
    {
        if (user.SubscriptionStatus == BillingSubscriptionStatus.Inactive)
            return (false, "SUBSCRIPTION_INACTIVE", "Subscription inactive.");
        var (_, maxC) = _limits.Resolve(user.CurrentPlan);
        if (user.ChatMessagesThisMonth >= maxC)
            return (false, "PLAN_LIMIT_EXCEEDED", $"AI chat limit reached ({maxC}/month).");
        return (true, null, null);
    }

    public void RecordChat(User user) => user.ChatMessagesThisMonth++;
}
