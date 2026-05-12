using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.Models;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Infrastructure.Rag;

public sealed class PineconeVectorStore : IPineconeVectorStore
{
    private readonly HttpClient _http;
    private readonly PineconeOptions _options;
    private readonly ILogger<PineconeVectorStore> _logger;

    public PineconeVectorStore(HttpClient http, IOptions<PineconeOptions> options, ILogger<PineconeVectorStore> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
    }

    public bool IsRemoteIndexConfigured => true;

    public async Task UpsertMeetingChunksAsync(string tenantKey, Guid meetingId, IReadOnlyList<MeetingChunkEmbedding> chunks, CancellationToken ct)
    {
        if (chunks.Count == 0)
            return;

        EnsureConfig();
        // TODO(Mustafa): verify embedding dimension equals Pinecone index dimension in every environment.

        var ns = BuildNamespace(tenantKey, meetingId);
        var vectors = chunks.Select((c, i) => new UpsertVector
        {
            Id = $"meeting-{meetingId:N}-chunk-{i:D4}",
            Values = c.Embedding,
            Metadata = new Dictionary<string, object?>
            {
                ["meetingId"] = meetingId.ToString(),
                ["chunkId"] = c.ChunkId,
                ["text"] = c.Text
            }
        }).ToList();

        var payload = new UpsertRequest { Namespace = ns, Vectors = vectors };
        var dim = vectors.Count > 0 ? vectors[0].Values.Length : 0;
        _logger.LogInformation(
            "Pinecone upsert: index={Index}, namespace={Namespace}, vectors={Count}, dimensions={Dim}",
            _options.IndexName,
            ns,
            vectors.Count,
            dim);
        await PostAsync("/vectors/upsert", payload, ct).ConfigureAwait(false);
    }

    public async Task<IReadOnlyList<RetrievedChunk>> QueryMeetingAsync(string tenantKey, Guid meetingId, float[] queryEmbedding, int topK, CancellationToken ct)
    {
        EnsureConfig();
        var ns = BuildNamespace(tenantKey, meetingId);
        var payload = new QueryRequest
        {
            Namespace = ns,
            TopK = Math.Max(1, topK),
            Vector = queryEmbedding,
            IncludeMetadata = true
        };

        var response = await PostAsync<QueryResponse>("/query", payload, ct).ConfigureAwait(false);
        return (response.Matches ?? new List<QueryMatch>())
            .Select(m =>
            {
                var text = m.Metadata is null || !m.Metadata.TryGetValue("text", out var t) ? string.Empty : t?.ToString() ?? string.Empty;
                var chunkId = m.Metadata is null || !m.Metadata.TryGetValue("chunkId", out var c) ? m.Id : c?.ToString() ?? m.Id;
                return new RetrievedChunk(meetingId, chunkId, text, m.Score);
            })
            .ToList();
    }

    public async Task<int> GetIndexedVectorCountAsync(string tenantKey, Guid meetingId, CancellationToken ct)
    {
        try
        {
            EnsureConfig();
            var ns = BuildNamespace(tenantKey, meetingId);
            var response = await PostAsync<DescribeIndexStatsResponse>("/describe_index_stats", new { }, ct).ConfigureAwait(false);
            if (response.Namespaces is null)
                return 0;
            return response.Namespaces.TryGetValue(ns, out var stats) ? stats.ResolvedVectorCount : 0;
        }
        catch
        {
            return 0;
        }
    }

    private void EnsureConfig()
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
            throw new InvalidOperationException("Pinecone:ApiKey is required.");
        if (string.IsNullOrWhiteSpace(_options.IndexName))
            throw new InvalidOperationException("Pinecone:IndexName is required.");
    }

    private string BuildNamespace(string tenantKey, Guid meetingId) => $"{_options.NamespacePrefix}-{tenantKey}-{meetingId:N}";

    private async Task PostAsync(string path, object payload, CancellationToken ct)
    {
        await PostAsync<object>(path, payload, ct).ConfigureAwait(false);
    }

    private async Task<T> PostAsync<T>(string path, object payload, CancellationToken ct)
    {
        using var msg = new HttpRequestMessage(HttpMethod.Post, path);
        msg.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        msg.Headers.Add("Api-Key", _options.ApiKey);
        msg.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        using var res = await _http.SendAsync(msg, ct).ConfigureAwait(false);
        var body = await res.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        if (!res.IsSuccessStatusCode)
            throw new InvalidOperationException($"Pinecone request failed: {(int)res.StatusCode} {body}");
        if (typeof(T) == typeof(object))
            return default!;
        return JsonSerializer.Deserialize<T>(body, JsonOpts) ?? throw new InvalidOperationException("Pinecone returned invalid payload.");
    }

    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    private sealed class UpsertRequest
    {
        [JsonPropertyName("namespace")]
        public string Namespace { get; set; } = string.Empty;

        [JsonPropertyName("vectors")]
        public List<UpsertVector> Vectors { get; set; } = new();
    }

    private sealed class UpsertVector
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("values")]
        public float[] Values { get; set; } = Array.Empty<float>();

        [JsonPropertyName("metadata")]
        public Dictionary<string, object?> Metadata { get; set; } = new();
    }

    private sealed class QueryRequest
    {
        [JsonPropertyName("namespace")]
        public string Namespace { get; set; } = string.Empty;

        [JsonPropertyName("topK")]
        public int TopK { get; set; }

        [JsonPropertyName("vector")]
        public float[] Vector { get; set; } = Array.Empty<float>();

        [JsonPropertyName("includeMetadata")]
        public bool IncludeMetadata { get; set; }
    }

    private sealed class QueryResponse
    {
        [JsonPropertyName("matches")]
        public List<QueryMatch>? Matches { get; set; }
    }

    private sealed class QueryMatch
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("score")]
        public double Score { get; set; }

        [JsonPropertyName("metadata")]
        public Dictionary<string, object?>? Metadata { get; set; }
    }

    private sealed class DescribeIndexStatsResponse
    {
        [JsonPropertyName("namespaces")]
        public Dictionary<string, NamespaceStats>? Namespaces { get; set; }
    }

    private sealed class NamespaceStats
    {
        [JsonPropertyName("vectorCount")]
        public int? VectorCountCamel { get; set; }

        [JsonPropertyName("vector_count")]
        public int? VectorCountSnake { get; set; }

        public int ResolvedVectorCount => VectorCountCamel ?? VectorCountSnake ?? 0;
    }
}
