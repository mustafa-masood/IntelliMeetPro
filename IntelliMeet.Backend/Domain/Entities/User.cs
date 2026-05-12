using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Domain.Entities;

public sealed class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }

    public bool CalendarConnected { get; set; }

    /// <summary>Short-lived Google Calendar API access token. // TODO(Mustafa): encrypt at rest.</summary>
    public string? GoogleAccessToken { get; set; }

    public string? GoogleRefreshToken { get; set; }

    public DateTimeOffset? GoogleTokenExpiryUtc { get; set; }

    /// <summary>Last successful Google calendar → meetings sync (timer or manual).</summary>
    public DateTimeOffset? CalendarLastSyncAtUtc { get; set; }

    /// <summary>Meeting BaaS calendar connection persisted for the user (Calendar page).</summary>
    public bool IsCalendarConnected { get; set; }

    /// <summary>External id from Meeting BaaS <c>POST /v2/calendars</c>.</summary>
    public string? MeetingBaasCalendarId { get; set; }

    /// <summary><c>google</c> or <c>outlook</c> when linked via Meeting BaaS.</summary>
    public string? CalendarProvider { get; set; }

    /// <summary>Clerk <c>sub</c> or other IdP subject.</summary>
    public string? ExternalUserId { get; set; }

    public string? ExternalAuthProvider { get; set; }

    /// <summary>Primary workspace for listings and billing.</summary>
    public Guid? WorkspaceId { get; set; }

    public string? StripeCustomerId { get; set; }

    public BillingSubscriptionTier CurrentPlan { get; set; } = BillingSubscriptionTier.None;

    public BillingSubscriptionStatus SubscriptionStatus { get; set; } = BillingSubscriptionStatus.None;

    public DateTimeOffset? PlanEndDateUtc { get; set; }

    public int MeetingsThisMonth { get; set; }

    public int ChatMessagesThisMonth { get; set; }

    /// <summary>Stripe subscription id for webhook correlation.</summary>
    public string? StripeSubscriptionId { get; set; }
}
