using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Application.Services;

public sealed class IntegrationTokenService : IIntegrationTokenService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IOptions<AsanaOptions> _asana;
    private readonly IOptions<JiraOptions> _jira;

    public IntegrationTokenService(
        IHttpClientFactory httpClientFactory,
        IOptions<AsanaOptions> asana,
        IOptions<JiraOptions> jira)
    {
        _httpClientFactory = httpClientFactory;
        _asana = asana;
        _jira = jira;
    }

    public async Task EnsureValidAccessAsync(ProjectManagementIntegration row, ProjectManagementPlatform platform, CancellationToken ct)
    {
        if (platform == ProjectManagementPlatform.Trello)
            return;

        if (string.IsNullOrEmpty(row.RefreshToken))
            return;

        var now = DateTimeOffset.UtcNow;
        if (row.ExpiresAtUtc is { } exp && exp > now.AddMinutes(10))
            return;

        var client = _httpClientFactory.CreateClient();

        if (platform == ProjectManagementPlatform.Asana)
            await RefreshAsanaAsync(client, row, ct).ConfigureAwait(false);
        else if (platform == ProjectManagementPlatform.Jira)
            await RefreshJiraAsync(client, row, ct).ConfigureAwait(false);
    }

    private async Task RefreshAsanaAsync(HttpClient client, ProjectManagementIntegration row, CancellationToken ct)
    {
        var o = _asana.Value;
        if (string.IsNullOrWhiteSpace(o.ClientId) || string.IsNullOrWhiteSpace(o.ClientSecret))
            return;

        var form = new List<KeyValuePair<string, string>>
        {
            new("grant_type", "refresh_token"),
            new("client_id", o.ClientId),
            new("client_secret", o.ClientSecret),
            new("refresh_token", row.RefreshToken!)
        };
        using var req = new HttpRequestMessage(HttpMethod.Post, o.TokenUrl) { Content = new FormUrlEncodedContent(form) };
        using var res = await client.SendAsync(req, ct).ConfigureAwait(false);
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;
        if (root.TryGetProperty("access_token", out var at))
            row.AccessToken = at.GetString() ?? row.AccessToken;
        if (root.TryGetProperty("refresh_token", out var rt) && rt.ValueKind == JsonValueKind.String)
            row.RefreshToken = rt.GetString();
        if (root.TryGetProperty("expires_in", out var exp) && exp.TryGetInt32(out var sec))
            row.ExpiresAtUtc = DateTimeOffset.UtcNow.AddSeconds(Math.Max(60, sec));
        row.UpdatedAtUtc = DateTimeOffset.UtcNow;
    }

    private async Task RefreshJiraAsync(HttpClient client, ProjectManagementIntegration row, CancellationToken ct)
    {
        var o = _jira.Value;
        if (string.IsNullOrWhiteSpace(o.ClientId) || string.IsNullOrWhiteSpace(o.ClientSecret))
            return;

        var payload = new Dictionary<string, string>
        {
            ["grant_type"] = "refresh_token",
            ["client_id"] = o.ClientId,
            ["client_secret"] = o.ClientSecret,
            ["refresh_token"] = row.RefreshToken!
        };
        using var req = new HttpRequestMessage(HttpMethod.Post, o.TokenUrl)
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };
        using var res = await client.SendAsync(req, ct).ConfigureAwait(false);
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;
        if (root.TryGetProperty("access_token", out var at))
            row.AccessToken = at.GetString() ?? row.AccessToken;
        if (root.TryGetProperty("refresh_token", out var rt) && rt.ValueKind == JsonValueKind.String)
            row.RefreshToken = rt.GetString();
        if (root.TryGetProperty("expires_in", out var exp) && exp.TryGetInt32(out var sec))
            row.ExpiresAtUtc = DateTimeOffset.UtcNow.AddSeconds(Math.Max(60, sec));
        row.UpdatedAtUtc = DateTimeOffset.UtcNow;
    }
}
