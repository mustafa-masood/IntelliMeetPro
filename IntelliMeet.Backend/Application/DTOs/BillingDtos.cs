namespace IntelliMeet.Backend.Application.DTOs;

public sealed class CreateCheckoutSessionRequestDto
{
    public string PriceId { get; set; } = string.Empty;
}

public sealed class CreateCheckoutSessionResponseDto
{
    public string SessionUrl { get; init; } = string.Empty;
}

public sealed class ConfirmCheckoutSessionRequestDto
{
    public string SessionId { get; set; } = string.Empty;
}

public sealed class UsageSummaryDto
{
    public string CurrentPlan { get; init; } = string.Empty;
    public string SubscriptionStatus { get; init; } = string.Empty;
    public int MeetingsThisMonth { get; init; }
    public int MeetingsLimit { get; init; }
    public int ChatThisMonth { get; init; }
    public int ChatLimit { get; init; }
}
