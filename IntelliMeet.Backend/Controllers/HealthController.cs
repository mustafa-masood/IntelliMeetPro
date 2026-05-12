using System.Diagnostics;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Infrastructure.Persistence;
using IntelliMeet.Backend.Infrastructure.Rag;
using IntelliMeet.Backend.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("health")]
public sealed class HealthController : ControllerBase
{
    private readonly IntelliMeetDbContext _db;
    private readonly IHttpClientFactory _httpFactory;
    private readonly IOptions<OllamaOptions> _ollama;
    private readonly IOptions<VoyageOptions> _voyage;
    private readonly IOptions<PineconeOptions> _pinecone;
    private readonly IPineconeVectorStore _pineconeStore;

    public HealthController(
        IntelliMeetDbContext db,
        IHttpClientFactory httpFactory,
        IOptions<OllamaOptions> ollama,
        IOptions<VoyageOptions> voyage,
        IOptions<PineconeOptions> pinecone,
        IPineconeVectorStore pineconeStore)
    {
        _db = db;
        _httpFactory = httpFactory;
        _ollama = ollama;
        _voyage = voyage;
        _pinecone = pinecone;
        _pineconeStore = pineconeStore;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();
        var postgresOk = false;
        string? postgresError = null;
        try
        {
            postgresOk = await _db.Database.CanConnectAsync(ct).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            postgresError = ex.Message;
        }

        var postgres = new { ok = postgresOk, latencyMs = sw.ElapsedMilliseconds, error = postgresError };

        sw.Restart();
        object ollama;
        try
        {
            var baseUrl = _ollama.Value.BaseUrl?.TrimEnd('/') ?? string.Empty;
            if (string.IsNullOrWhiteSpace(baseUrl))
                ollama = new { ok = false, error = "Ollama:BaseUrl is empty" };
            else if (!Uri.TryCreate(baseUrl, UriKind.Absolute, out var ollamaRoot))
                ollama = new { ok = false, error = "Ollama:BaseUrl is not a valid absolute URI" };
            else
            {
                using var http = _httpFactory.CreateClient(nameof(HealthController));
                http.Timeout = TimeSpan.FromSeconds(5);
                var tagsUri = new Uri(ollamaRoot, "api/tags");
                using var res = await http.GetAsync(tagsUri, ct).ConfigureAwait(false);
                ollama = new { ok = res.IsSuccessStatusCode, latencyMs = sw.ElapsedMilliseconds, status = (int)res.StatusCode };
            }
        }
        catch (Exception ex)
        {
            ollama = new { ok = false, error = ex.Message, latencyMs = sw.ElapsedMilliseconds };
        }

        var voyageKey = _voyage.Value.ApiKey;
        var voyage = string.IsNullOrWhiteSpace(voyageKey)
            ? (object)new { ok = false, configured = false, note = "Voyage:ApiKey missing" }
            : new { ok = true, configured = true };

        var p = _pinecone.Value;
        var pineconeConfigured = !string.IsNullOrWhiteSpace(p.ApiKey) && !string.IsNullOrWhiteSpace(p.IndexName)
            && PineconeDataPlaneUri.TryCreateBaseUri(p, out _);
        var remoteOk = _pineconeStore.IsRemoteIndexConfigured;
        var pinecone = new
        {
            ok = pineconeConfigured && remoteOk,
            configured = pineconeConfigured,
            noOpStore = !remoteOk
        };

        var components = new { postgres, ollama, voyage, pinecone };
        if (!postgresOk)
            return StatusCode(503, new { status = "unhealthy", components });

        return Ok(new { status = "ok", components });
    }
}
