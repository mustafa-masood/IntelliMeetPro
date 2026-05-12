using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Application.Services;

public sealed class IntegrationWorkflowService : IIntegrationWorkflowService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IProjectManagementIntegrationRepository _integrations;
    private readonly IActionItemRepository _actionItems;
    private readonly IMeetingRepository _meetings;
    private readonly IUserRepository _users;
    private readonly IIntegrationTokenService _tokenService;
    private readonly IOptions<AsanaOptions> _asana;
    private readonly IOptions<JiraOptions> _jira;
    private readonly IOptions<TrelloOptions> _trello;
    private readonly IOptions<IntegrationsOptions> _integrationGeneral;

    public IntegrationWorkflowService(
        IHttpClientFactory httpClientFactory,
        IProjectManagementIntegrationRepository integrations,
        IActionItemRepository actionItems,
        IMeetingRepository meetings,
        IUserRepository users,
        IIntegrationTokenService tokenService,
        IOptions<AsanaOptions> asana,
        IOptions<JiraOptions> jira,
        IOptions<TrelloOptions> trello,
        IOptions<IntegrationsOptions> integrationGeneral)
    {
        _httpClientFactory = httpClientFactory;
        _integrations = integrations;
        _actionItems = actionItems;
        _meetings = meetings;
        _users = users;
        _tokenService = tokenService;
        _asana = asana;
        _jira = jira;
        _trello = trello;
        _integrationGeneral = integrationGeneral;
    }

    public Task<IReadOnlyList<IntegrationConnectionDto>> GetStatusAsync(Guid userId, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        var list = new List<IntegrationConnectionDto>();
        foreach (var p in new[] { ProjectManagementPlatform.Asana, ProjectManagementPlatform.Jira, ProjectManagementPlatform.Trello })
        {
            var row = _integrations.GetByUserAndPlatform(userId, p);
            var connected = row is { AccessToken.Length: > 0 };
            list.Add(new IntegrationConnectionDto
            {
                Platform = p,
                Connected = connected,
                ProjectId = row?.ProjectId,
                BoardId = row?.BoardId,
                DisplayName = row?.SelectedTargetName
            });
        }
        return Task.FromResult<IReadOnlyList<IntegrationConnectionDto>>(list);
    }

    public string BuildAsanaAuthUrl(Guid userId)
    {
        var o = _asana.Value;
        var scopeRaw = string.IsNullOrWhiteSpace(o.Scopes) ? null : o.Scopes.Trim();
        var omitScope = scopeRaw is null;
        var redirect = Uri.EscapeDataString(o.RedirectUri);
        var client = Uri.EscapeDataString(o.ClientId);
        var state = Uri.EscapeDataString(userId.ToString());
        var url = $"{o.AuthUrl}?client_id={client}&redirect_uri={redirect}&response_type=code&state={state}";
        if (!omitScope)
        {
            var scope = Uri.EscapeDataString(scopeRaw!.Replace(",", " ").Trim());
            url += $"&scope={scope}";
        }

        return url;
    }

    public string BuildJiraAuthUrl(Guid userId)
    {
        var o = _jira.Value;
        var scopeRaw = string.IsNullOrWhiteSpace(o.Scopes)
            ? "offline_access read:jira-work write:jira-work"
            : o.Scopes;
        var scope = Uri.EscapeDataString(scopeRaw.Replace(",", " ").Trim());
        var redirect = Uri.EscapeDataString(o.RedirectUri);
        var client = Uri.EscapeDataString(o.ClientId);
        var state = Uri.EscapeDataString(userId.ToString());
        var audience = Uri.EscapeDataString("api.atlassian.com");
        return $"{o.AuthUrl}?audience={audience}&client_id={client}&scope={scope}&redirect_uri={redirect}&response_type=code&state={state}&prompt=consent";
    }

    public string BuildTrelloAuthorizeUrl()
    {
        var o = _trello.Value;
        var ret = Uri.EscapeDataString(o.ReturnUrl);
        var key = Uri.EscapeDataString(o.ApiKey);
        var name = Uri.EscapeDataString("IntelliMeet");
        if (!string.IsNullOrWhiteSpace(o.AuthUrl))
            return o.AuthUrl.Replace("{ReturnUrl}", o.ReturnUrl, StringComparison.Ordinal).Replace("{ApiKey}", o.ApiKey, StringComparison.Ordinal);
        return $"https://trello.com/1/authorize?expiration=never&name={name}&scope=read,write&response_type=token&key={key}&return_url={ret}";
    }

    public async Task HandleAsanaCallbackAsync(string code, string state, CancellationToken ct)
    {
        if (!Guid.TryParse(state, out var userId))
            throw new InvalidOperationException("Invalid OAuth state.");
        // TODO(Mustafa): CSRF-safe state parameter (signed/nonce), not only user id.

        var o = _asana.Value;
        var client = _httpClientFactory.CreateClient();
        var form = new List<KeyValuePair<string, string>>
        {
            new("grant_type", "authorization_code"),
            new("client_id", o.ClientId),
            new("client_secret", o.ClientSecret),
            new("redirect_uri", o.RedirectUri),
            new("code", code!)
        };
        using var req = new HttpRequestMessage(HttpMethod.Post, o.TokenUrl) { Content = new FormUrlEncodedContent(form) };
        using var res = await client.SendAsync(req, ct).ConfigureAwait(false);
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        await UpsertAsanaFromTokenResponseAsync(userId, json, ct).ConfigureAwait(false);
    }

    public async Task HandleJiraCallbackAsync(string code, string state, CancellationToken ct)
    {
        if (!Guid.TryParse(state, out var userId))
            throw new InvalidOperationException("Invalid OAuth state.");
        // TODO(Mustafa): CSRF-safe state parameter.

        var o = _jira.Value;
        var client = _httpClientFactory.CreateClient();
        var payload = new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["client_id"] = o.ClientId,
            ["client_secret"] = o.ClientSecret,
            ["code"] = code,
            ["redirect_uri"] = o.RedirectUri
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
        var access = root.GetProperty("access_token").GetString() ?? throw new InvalidOperationException("Missing access_token.");
        var refresh = root.TryGetProperty("refresh_token", out var rt) && rt.ValueKind == JsonValueKind.String
            ? rt.GetString()
            : null;
        DateTimeOffset? exp = null;
        if (root.TryGetProperty("expires_in", out var ei) && ei.TryGetInt32(out var sec))
            exp = DateTimeOffset.UtcNow.AddSeconds(Math.Max(60, sec));

        string? cloudId = null;
        using (var arReq = new HttpRequestMessage(HttpMethod.Get, o.AccessibleResourcesUrl))
        {
            arReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", access);
            using var arRes = await client.SendAsync(arReq, ct).ConfigureAwait(false);
            arRes.EnsureSuccessStatusCode();
            var arJson = await arRes.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
            using var arDoc = JsonDocument.Parse(arJson);
            if (arDoc.RootElement.ValueKind == JsonValueKind.Array && arDoc.RootElement.GetArrayLength() > 0)
            {
                var first = arDoc.RootElement[0];
                if (first.TryGetProperty("id", out var idEl))
                    cloudId = idEl.GetString();
            }
        }

        var now = DateTimeOffset.UtcNow;
        var existing = _integrations.GetTrackedByUserAndPlatform(userId, ProjectManagementPlatform.Jira);
        if (existing is null)
        {
            existing = new ProjectManagementIntegration
            {
                Id = Guid.NewGuid(),
                WorkspaceId = _users.GetById(userId)?.WorkspaceId,
                UserId = userId,
                Platform = ProjectManagementPlatform.Jira,
                CreatedAtUtc = now
            };
        }
        existing.WorkspaceId ??= _users.GetById(userId)?.WorkspaceId;
        existing.AccessToken = access;
        existing.RefreshToken = refresh;
        existing.ExpiresAtUtc = exp;
        existing.JiraCloudId = cloudId;
        existing.UpdatedAtUtc = now;
        _integrations.Upsert(existing);
    }

    public async Task ProcessTrelloTokenAsync(Guid userId, string token, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(token))
            throw new ArgumentException("Token required.", nameof(token));
        var now = DateTimeOffset.UtcNow;
        var existing = _integrations.GetTrackedByUserAndPlatform(userId, ProjectManagementPlatform.Trello);
        if (existing is null)
        {
            existing = new ProjectManagementIntegration
            {
                Id = Guid.NewGuid(),
                WorkspaceId = _users.GetById(userId)?.WorkspaceId,
                UserId = userId,
                Platform = ProjectManagementPlatform.Trello,
                CreatedAtUtc = now
            };
        }
        existing.WorkspaceId ??= _users.GetById(userId)?.WorkspaceId;
        existing.AccessToken = token.Trim();
        existing.RefreshToken = null;
        existing.ExpiresAtUtc = null;
        existing.UpdatedAtUtc = now;
        _integrations.Upsert(existing);
        await Task.CompletedTask.ConfigureAwait(false);
    }

    public async Task<IReadOnlyList<IntegrationSetupOptionDto>> GetSetupOptionsAsync(Guid userId, ProjectManagementPlatform platform, CancellationToken ct)
    {
        var rowProbe = _integrations.GetTrackedByUserAndPlatform(userId, platform);
        var row = rowProbe
                  ?? throw new InvalidOperationException("Connect the integration first.");
        await _tokenService.EnsureValidAccessAsync(row, platform, ct).ConfigureAwait(false);
        _integrations.Upsert(row);

        return platform switch
        {
            ProjectManagementPlatform.Asana => await ListAsanaOptionsAsync(row, ct).ConfigureAwait(false),
            ProjectManagementPlatform.Jira => await ListJiraProjectsAsync(row, ct).ConfigureAwait(false),
            ProjectManagementPlatform.Trello => await ListTrelloBoardsAsync(row, ct).ConfigureAwait(false),
            _ => throw new ArgumentOutOfRangeException(nameof(platform))
        };
    }

    public async Task CompleteSetupAsync(Guid userId, ProjectManagementPlatform platform, IntegrationSetupPostDto body, CancellationToken ct)
    {
        var rowProbe = _integrations.GetTrackedByUserAndPlatform(userId, platform);
        var row = rowProbe
                  ?? throw new InvalidOperationException("Connect the integration first.");
        await _tokenService.EnsureValidAccessAsync(row, platform, ct).ConfigureAwait(false);

        var now = DateTimeOffset.UtcNow;
        if (platform == ProjectManagementPlatform.Trello)
        {
            if (string.IsNullOrWhiteSpace(body.BoardId))
                throw new ArgumentException("boardId required for Trello.");
            row.BoardId = body.BoardId.Trim();
            row.ProjectId = null;
            row.SelectedTargetName = await ResolveTrelloBoardNameAsync(row, row.BoardId!, ct).ConfigureAwait(false);
        }
        else
        {
            if (string.IsNullOrWhiteSpace(body.ProjectId))
                throw new ArgumentException("projectId required.");
            row.ProjectId = body.ProjectId!.Trim();
            row.BoardId = null;
            row.SelectedTargetName = platform == ProjectManagementPlatform.Asana
                ? await ResolveAsanaProjectNameAsync(row, row.ProjectId!, ct).ConfigureAwait(false)
                : await ResolveJiraProjectNameAsync(row, row.ProjectId!, ct).ConfigureAwait(false);
        }

        row.UpdatedAtUtc = now;
        _integrations.Upsert(row);
    }

    public async Task<PushActionItemResponseDto> PushActionItemAsync(Guid userId, ProjectManagementPlatform platform, PushActionItemRequestDto body, CancellationToken ct)
    {
        var row = _integrations.GetTrackedByUserAndPlatform(userId, platform)
                  ?? throw new InvalidOperationException("Connect and configure the integration first.");
        if (platform != ProjectManagementPlatform.Trello && string.IsNullOrWhiteSpace(row.ProjectId))
            throw new InvalidOperationException("Choose a default project in integration setup.");
        if (platform == ProjectManagementPlatform.Trello && string.IsNullOrWhiteSpace(row.BoardId))
            throw new InvalidOperationException("Choose a default board in integration setup.");

        await _tokenService.EnsureValidAccessAsync(row, platform, ct).ConfigureAwait(false);
        _integrations.Upsert(row);

        var title = body.ActionItemText?.Trim();
        ActionItem? item = null;
        if (body.ActionItemId is { } aid)
        {
            item = _actionItems.GetById(aid) ?? throw new KeyNotFoundException("Action item not found.");
            if (item.MeetingId != body.MeetingId)
                throw new InvalidOperationException("Action item does not belong to this meeting.");
            title = string.IsNullOrWhiteSpace(title) ? item.Title : title;
        }
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Provide actionItemId or actionItemText.");

        var meeting = _meetings.GetById(body.MeetingId) ?? throw new KeyNotFoundException("Meeting not found.");
        var baseNote = _integrationGeneral.Value.MeetingLinkBaseUrl?.TrimEnd('/') ?? "";
        var notes = string.IsNullOrEmpty(baseNote)
            ? $"Meeting: {meeting.Title} (id {meeting.Id})"
            : $"{baseNote}/meetings/{meeting.Id} — {meeting.Title}";

        string? url = platform switch
        {
            ProjectManagementPlatform.Asana => await PushAsanaAsync(row, title!, notes, ct).ConfigureAwait(false),
            ProjectManagementPlatform.Jira => await PushJiraAsync(row, title!, notes, ct).ConfigureAwait(false),
            ProjectManagementPlatform.Trello => await PushTrelloAsync(row, title!, notes, ct).ConfigureAwait(false),
            _ => throw new ArgumentOutOfRangeException(nameof(platform))
        };

        if (item is not null)
        {
            item.ExternalTaskUrl = url;
            item.SyncedPlatform = platform;
            _actionItems.Upsert(item);
        }

        return new PushActionItemResponseDto { ExternalUrl = url, Platform = platform };
    }

    public Task DisconnectAsync(Guid userId, ProjectManagementPlatform platform, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        _integrations.DeleteByUserAndPlatform(userId, platform);
        return Task.CompletedTask;
    }

    private async Task UpsertAsanaFromTokenResponseAsync(Guid userId, string json, CancellationToken ct)
    {
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;
        var access = root.GetProperty("access_token").GetString() ?? throw new InvalidOperationException("Missing access_token.");
        var refresh = root.TryGetProperty("refresh_token", out var rt) && rt.ValueKind == JsonValueKind.String
            ? rt.GetString()
            : null;
        DateTimeOffset? exp = null;
        if (root.TryGetProperty("expires_in", out var ei) && ei.TryGetInt32(out var sec))
            exp = DateTimeOffset.UtcNow.AddSeconds(Math.Max(60, sec));

        var now = DateTimeOffset.UtcNow;
        var existing = _integrations.GetTrackedByUserAndPlatform(userId, ProjectManagementPlatform.Asana);
        if (existing is null)
        {
            existing = new ProjectManagementIntegration
            {
                Id = Guid.NewGuid(),
                WorkspaceId = _users.GetById(userId)?.WorkspaceId,
                UserId = userId,
                Platform = ProjectManagementPlatform.Asana,
                CreatedAtUtc = now
            };
        }
        existing.WorkspaceId ??= _users.GetById(userId)?.WorkspaceId;
        existing.AccessToken = access;
        existing.RefreshToken = refresh;
        existing.ExpiresAtUtc = exp;
        existing.UpdatedAtUtc = now;
        _integrations.Upsert(existing);
        await Task.CompletedTask.ConfigureAwait(false);
    }

    private async Task<IReadOnlyList<IntegrationSetupOptionDto>> ListAsanaOptionsAsync(ProjectManagementIntegration row, CancellationToken ct)
    {
        var o = _asana.Value;
        var baseUri = o.ApiBaseUrl.TrimEnd('/') + "/";
        var client = _httpClientFactory.CreateClient();
        var list = new List<IntegrationSetupOptionDto>();
        var workspaces = new List<(string Gid, string Name)>();

        using (var wReq = new HttpRequestMessage(HttpMethod.Get, new Uri(new Uri(baseUri), "workspaces")))
        {
            wReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", row.AccessToken);
            using var wRes = await client.SendAsync(wReq, ct).ConfigureAwait(false);
            wRes.EnsureSuccessStatusCode();
            var wJson = await wRes.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
            using var wDoc = JsonDocument.Parse(wJson);
            if (wDoc.RootElement.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Array)
            {
                foreach (var ws in data.EnumerateArray())
                {
                    var gid = ws.GetProperty("gid").GetString() ?? "";
                    var name = ws.TryGetProperty("name", out var n) ? n.GetString() ?? gid : gid;
                    workspaces.Add((gid, name ?? gid));
                    list.Add(new IntegrationSetupOptionDto { Id = gid, Name = name ?? gid, Type = "workspace" });
                }
            }
        }

        foreach (var (wsGid, _) in workspaces)
        {
            var url = new Uri(new Uri(baseUri), "projects?workspace=" + Uri.EscapeDataString(wsGid) + "&opt_fields=name,gid");
            using var pReq = new HttpRequestMessage(HttpMethod.Get, url);
            pReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", row.AccessToken);
            using var pRes = await client.SendAsync(pReq, ct).ConfigureAwait(false);
            if (!pRes.IsSuccessStatusCode)
                continue;
            var pJson = await pRes.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
            using var pDoc = JsonDocument.Parse(pJson);
            if (pDoc.RootElement.TryGetProperty("data", out var pdata) && pdata.ValueKind == JsonValueKind.Array)
            {
                foreach (var pr in pdata.EnumerateArray())
                {
                    var gid = pr.GetProperty("gid").GetString() ?? "";
                    var name = pr.TryGetProperty("name", out var n) ? n.GetString() ?? gid : gid;
                    list.Add(new IntegrationSetupOptionDto { Id = gid, Name = name ?? gid, Type = "project" });
                }
            }
        }

        return list;
    }

    private async Task<IReadOnlyList<IntegrationSetupOptionDto>> ListJiraProjectsAsync(ProjectManagementIntegration row, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(row.JiraCloudId))
            throw new InvalidOperationException("Jira cloud id missing; reconnect Jira.");
        var client = _httpClientFactory.CreateClient();
        var url = $"https://api.atlassian.com/ex/jira/{row.JiraCloudId}/rest/api/3/project";
        using var req = new HttpRequestMessage(HttpMethod.Get, url);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", row.AccessToken);
        using var res = await client.SendAsync(req, ct).ConfigureAwait(false);
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        using var doc = JsonDocument.Parse(json);
        var list = new List<IntegrationSetupOptionDto>();
        if (doc.RootElement.ValueKind != JsonValueKind.Array)
            return list;
        foreach (var p in doc.RootElement.EnumerateArray())
        {
            var id = p.TryGetProperty("id", out var idEl) ? idEl.GetString() : null;
            var name = p.TryGetProperty("name", out var n) ? n.GetString() : id;
            if (string.IsNullOrEmpty(id))
                continue;
            list.Add(new IntegrationSetupOptionDto { Id = id!, Name = name ?? id!, Type = "project" });
        }
        return list;
    }

    private async Task<IReadOnlyList<IntegrationSetupOptionDto>> ListTrelloBoardsAsync(ProjectManagementIntegration row, CancellationToken ct)
    {
        var o = _trello.Value;
        var client = _httpClientFactory.CreateClient();
        var url = $"https://api.trello.com/1/members/me/boards?key={Uri.EscapeDataString(o.ApiKey)}&token={Uri.EscapeDataString(row.AccessToken)}";
        using var res = await client.GetAsync(url, ct).ConfigureAwait(false);
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        using var doc = JsonDocument.Parse(json);
        var list = new List<IntegrationSetupOptionDto>();
        if (doc.RootElement.ValueKind != JsonValueKind.Array)
            return list;
        foreach (var b in doc.RootElement.EnumerateArray())
        {
            var id = b.GetProperty("id").GetString() ?? "";
            var name = b.TryGetProperty("name", out var n) ? n.GetString() ?? id : id;
            list.Add(new IntegrationSetupOptionDto { Id = id, Name = name ?? id, Type = "board" });
        }
        return list;
    }

    private async Task<string?> ResolveAsanaProjectNameAsync(ProjectManagementIntegration row, string projectGid, CancellationToken ct)
    {
        var o = _asana.Value;
        var client = _httpClientFactory.CreateClient();
        var url = new Uri(new Uri(o.ApiBaseUrl), "projects/" + Uri.EscapeDataString(projectGid) + "?opt_fields=name");
        using var req = new HttpRequestMessage(HttpMethod.Get, url);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", row.AccessToken);
        using var res = await client.SendAsync(req, ct).ConfigureAwait(false);
        if (!res.IsSuccessStatusCode)
            return projectGid;
        var json = await res.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        using var doc = JsonDocument.Parse(json);
        if (doc.RootElement.TryGetProperty("data", out var data) && data.TryGetProperty("name", out var n))
            return n.GetString();
        return projectGid;
    }

    private async Task<string?> ResolveJiraProjectNameAsync(ProjectManagementIntegration row, string projectId, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(row.JiraCloudId))
            return projectId;
        var client = _httpClientFactory.CreateClient();
        var url = $"https://api.atlassian.com/ex/jira/{row.JiraCloudId}/rest/api/3/project/{Uri.EscapeDataString(projectId)}";
        using var req = new HttpRequestMessage(HttpMethod.Get, url);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", row.AccessToken);
        using var res = await client.SendAsync(req, ct).ConfigureAwait(false);
        if (!res.IsSuccessStatusCode)
            return projectId;
        var json = await res.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        using var doc = JsonDocument.Parse(json);
        return doc.RootElement.TryGetProperty("name", out var n) ? n.GetString() : projectId;
    }

    private async Task<string?> ResolveTrelloBoardNameAsync(ProjectManagementIntegration row, string boardId, CancellationToken ct)
    {
        var o = _trello.Value;
        var client = _httpClientFactory.CreateClient();
        var url = $"https://api.trello.com/1/boards/{Uri.EscapeDataString(boardId)}?fields=name&key={Uri.EscapeDataString(o.ApiKey)}&token={Uri.EscapeDataString(row.AccessToken)}";
        using var res = await client.GetAsync(url, ct).ConfigureAwait(false);
        if (!res.IsSuccessStatusCode)
            return boardId;
        var json = await res.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        using var doc = JsonDocument.Parse(json);
        return doc.RootElement.TryGetProperty("name", out var n) ? n.GetString() : boardId;
    }

    private async Task<string?> PushAsanaAsync(ProjectManagementIntegration row, string title, string notes, CancellationToken ct)
    {
        var o = _asana.Value;
        var client = _httpClientFactory.CreateClient();
        var url = new Uri(new Uri(o.ApiBaseUrl), "tasks");
        var bodyObj = new Dictionary<string, object?>
        {
            ["data"] = new Dictionary<string, object?>
            {
                ["projects"] = new[] { row.ProjectId! },
                ["name"] = title,
                ["notes"] = notes
            }
        };
        using var req = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(JsonSerializer.Serialize(bodyObj), Encoding.UTF8, "application/json")
        };
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", row.AccessToken);
        using var res = await client.SendAsync(req, ct).ConfigureAwait(false);
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        using var doc = JsonDocument.Parse(json);
        if (doc.RootElement.TryGetProperty("data", out var data) && data.TryGetProperty("permalink_url", out var pu))
            return pu.GetString();
        if (doc.RootElement.TryGetProperty("data", out var d2) && d2.TryGetProperty("gid", out var gid))
            return "https://app.asana.com/0/" + gid.GetString();
        return null;
    }

    private async Task<string?> PushJiraAsync(ProjectManagementIntegration row, string title, string notes, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(row.JiraCloudId))
            throw new InvalidOperationException("Jira cloud id missing.");

        var client = _httpClientFactory.CreateClient();
        var url = $"https://api.atlassian.com/ex/jira/{row.JiraCloudId}/rest/api/3/issue";

        var desc = new Dictionary<string, object?>
        {
            ["type"] = "doc",
            ["version"] = 1,
            ["content"] = new object[]
            {
                new Dictionary<string, object?>
                {
                    ["type"] = "paragraph",
                    ["content"] = new object[] { new Dictionary<string, object?> { ["type"] = "text", ["text"] = notes } }
                }
            }
        };

        var fields = new Dictionary<string, object?>
        {
            ["project"] = new Dictionary<string, string> { ["id"] = row.ProjectId! },
            ["summary"] = title,
            ["description"] = desc,
            ["issuetype"] = new Dictionary<string, string> { ["name"] = "Task" }
        };

        var payload = new Dictionary<string, object?> { ["fields"] = fields };
        using var req = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", row.AccessToken);
        using var res = await client.SendAsync(req, ct).ConfigureAwait(false);
        if (!res.IsSuccessStatusCode)
        {
            var err = await res.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
            throw new InvalidOperationException($"Jira create issue failed: {(int)res.StatusCode} {err}");
        }

        var json = await res.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        using var doc = JsonDocument.Parse(json);
        if (doc.RootElement.TryGetProperty("key", out var keyEl))
        {
            var key = keyEl.GetString();
            if (!string.IsNullOrEmpty(key) && doc.RootElement.TryGetProperty("self", out var self))
                return self.GetString();
            // TODO(Mustafa): build browse URL from site if self is API URL
        }
        return doc.RootElement.TryGetProperty("self", out var s) ? s.GetString() : null;
    }

    private async Task<string?> PushTrelloAsync(ProjectManagementIntegration row, string title, string notes, CancellationToken ct)
    {
        var o = _trello.Value;
        var client = _httpClientFactory.CreateClient();
        var listsUrl = $"https://api.trello.com/1/boards/{Uri.EscapeDataString(row.BoardId!)}/lists?key={Uri.EscapeDataString(o.ApiKey)}&token={Uri.EscapeDataString(row.AccessToken)}";
        using var lr = await client.GetAsync(listsUrl, ct).ConfigureAwait(false);
        lr.EnsureSuccessStatusCode();
        var ljson = await lr.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        using var ldoc = JsonDocument.Parse(ljson);
        string? listId = null;
        if (ldoc.RootElement.ValueKind == JsonValueKind.Array)
        {
            foreach (var list in ldoc.RootElement.EnumerateArray())
            {
                if (list.TryGetProperty("closed", out var c) && c.ValueKind == JsonValueKind.True)
                    continue;
                var name = list.TryGetProperty("name", out var n) ? n.GetString() ?? "" : "";
                if (name.Contains("To Do", StringComparison.OrdinalIgnoreCase) || name.Contains("Todo", StringComparison.OrdinalIgnoreCase))
                {
                    listId = list.GetProperty("id").GetString();
                    break;
                }
            }
            listId ??= ldoc.RootElement.GetArrayLength() > 0
                ? ldoc.RootElement[0].GetProperty("id").GetString()
                : null;
        }
        if (string.IsNullOrEmpty(listId))
            throw new InvalidOperationException("No open list found on Trello board.");

        // TODO(Mustafa): configurable default list id instead of first / To Do heuristic.

        var addUrl =
            $"https://api.trello.com/1/cards?key={Uri.EscapeDataString(o.ApiKey)}&token={Uri.EscapeDataString(row.AccessToken)}" +
            $"&idList={Uri.EscapeDataString(listId)}&name={Uri.EscapeDataString(title)}&desc={Uri.EscapeDataString(notes)}";
        using var cr = await client.PostAsync(addUrl, null, ct).ConfigureAwait(false);
        cr.EnsureSuccessStatusCode();
        var cjson = await cr.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        using var cdoc = JsonDocument.Parse(cjson);
        return cdoc.RootElement.TryGetProperty("shortUrl", out var su)
            ? su.GetString()
            : cdoc.RootElement.TryGetProperty("url", out var u) ? u.GetString() : null;
    }
}
