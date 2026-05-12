using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Options;

public sealed class PlanLimitsOptions
{
    public const string SectionName = "PlanLimits";

    public int DefaultMeetingsPerMonth { get; set; } = 100;
    public int DefaultChatPerMonth { get; set; } = 1000;

    public Dictionary<string, PlanLimitEntry> ByTier { get; set; } = new()
    {
        [nameof(BillingSubscriptionTier.Basic)] = new PlanLimitEntry { MeetingsPerMonth = 5, ChatPerMonth = 50 },
        [nameof(BillingSubscriptionTier.Starter)] = new PlanLimitEntry { MeetingsPerMonth = 10, ChatPerMonth = 100 },
        [nameof(BillingSubscriptionTier.Pro)] = new PlanLimitEntry { MeetingsPerMonth = 50, ChatPerMonth = 500 },
        [nameof(BillingSubscriptionTier.Premium)] = new PlanLimitEntry { MeetingsPerMonth = 200, ChatPerMonth = 2000 },
        [nameof(BillingSubscriptionTier.Enterprise)] = new PlanLimitEntry { MeetingsPerMonth = 10_000, ChatPerMonth = 100_000 }
    };

    public (int meetings, int chat) Resolve(BillingSubscriptionTier tier)
    {
        if (tier == BillingSubscriptionTier.None)
            return (DefaultMeetingsPerMonth, DefaultChatPerMonth);
        var key = tier.ToString();
        if (ByTier.TryGetValue(key, out var e))
            return (e.MeetingsPerMonth, e.ChatPerMonth);
        return (DefaultMeetingsPerMonth, DefaultChatPerMonth);
    }
}

public sealed class PlanLimitEntry
{
    public int MeetingsPerMonth { get; set; }
    public int ChatPerMonth { get; set; }
}
