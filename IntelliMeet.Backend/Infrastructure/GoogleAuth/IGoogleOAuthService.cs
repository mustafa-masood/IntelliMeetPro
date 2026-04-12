namespace IntelliMeet.Backend.Infrastructure.GoogleAuth;

public interface IGoogleOAuthService
{
    Task<GoogleTokenExchangeResult> ExchangeAuthorizationCodeAsync(string code, CancellationToken ct);
}

public sealed record GoogleTokenExchangeResult(
    bool Success,
    string? RefreshToken,
    string? AccessToken,
    int ExpiresInSeconds,
    string? Email,
    string? Error);
