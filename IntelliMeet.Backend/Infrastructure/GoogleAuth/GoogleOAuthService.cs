using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Infrastructure.GoogleAuth;

public sealed class GoogleOAuthService : IGoogleOAuthService
{
    private readonly HttpClient _http;
    private readonly GoogleOAuthOptions _opt;
    private readonly ILogger<GoogleOAuthService> _logger;

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public GoogleOAuthService(HttpClient http, IOptions<GoogleOAuthOptions> opt, ILogger<GoogleOAuthService> logger)
    {
        _http = http;
        _opt = opt.Value;
        _logger = logger;
    }

    public async Task<GoogleTokenExchangeResult> ExchangeAuthorizationCodeAsync(string code, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_opt.ClientId) || string.IsNullOrWhiteSpace(_opt.ClientSecret))
            return new GoogleTokenExchangeResult(false, null, null, 0, null, "Google OAuth client id/secret are not configured on the server.");

        var form = new Dictionary<string, string>
        {
            ["code"] = code,
            ["client_id"] = _opt.ClientId,
            ["client_secret"] = _opt.ClientSecret,
            ["redirect_uri"] = _opt.RedirectUri,
            ["grant_type"] = "authorization_code"
        };
        using var content = new FormUrlEncodedContent(form);
        using var req = new HttpRequestMessage(HttpMethod.Post, "https://oauth2.googleapis.com/token") { Content = content };
        using var resp = await _http.SendAsync(req, ct).ConfigureAwait(false);
        var body = await resp.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        if (!resp.IsSuccessStatusCode)
        {
            _logger.LogWarning("Google token exchange failed: {Body}", body);
            return new GoogleTokenExchangeResult(false, null, null, 0, null, body);
        }
        TokenResponse? tr;
        try
        {
            tr = JsonSerializer.Deserialize<TokenResponse>(body, JsonOpts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Google token JSON parse failed");
            return new GoogleTokenExchangeResult(false, null, null, 0, null, ex.Message);
        }
        if (tr?.AccessToken is null)
            return new GoogleTokenExchangeResult(false, null, null, 0, null, "No access_token in Google response.");

        string? email = null;
        try
        {
            using var uiReq = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com/oauth2/v2/userinfo");
            uiReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tr.AccessToken);
            using var uiResp = await _http.SendAsync(uiReq, ct).ConfigureAwait(false);
            if (uiResp.IsSuccessStatusCode)
            {
                var uiJson = await uiResp.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
                using var doc = JsonDocument.Parse(uiJson);
                if (doc.RootElement.TryGetProperty("email", out var e))
                    email = e.GetString();
            }
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "userinfo fetch skipped");
        }

        return new GoogleTokenExchangeResult(true, tr.RefreshToken, tr.AccessToken, tr.ExpiresIn, email, null);
    }

    private sealed class TokenResponse
    {
        [JsonPropertyName("access_token")]
        public string? AccessToken { get; set; }

        [JsonPropertyName("refresh_token")]
        public string? RefreshToken { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }
    }
}
