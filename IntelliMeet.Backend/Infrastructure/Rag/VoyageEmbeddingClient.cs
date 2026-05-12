using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Infrastructure.Rag;

public sealed class VoyageEmbeddingClient : IEmbeddingClient
{
    private readonly HttpClient _http;
    private readonly VoyageOptions _options;
    private readonly ILogger<VoyageEmbeddingClient> _logger;

    public VoyageEmbeddingClient(HttpClient http, IOptions<VoyageOptions> options, ILogger<VoyageEmbeddingClient> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<float[]> GetEmbeddingAsync(string text, CancellationToken ct)
    {
        var list = await GetEmbeddingsAsync(new[] { text }, ct).ConfigureAwait(false);
        return list[0];
    }

    public async Task<IReadOnlyList<float[]>> GetEmbeddingsAsync(IReadOnlyList<string> texts, CancellationToken ct)
    {
        if (texts.Count == 0)
            return Array.Empty<float[]>();

        if (string.IsNullOrWhiteSpace(_options.ApiKey))
            throw new InvalidOperationException("Voyage:ApiKey is required.");

        var request = new VoyageEmbeddingRequest
        {
            Model = _options.EmbeddingModel,
            Input = texts.ToList()
        };

        using var msg = new HttpRequestMessage(HttpMethod.Post, "embeddings");
        msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);
        msg.Content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");

        using var res = await _http.SendAsync(msg, ct).ConfigureAwait(false);
        var body = await res.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        if (!res.IsSuccessStatusCode)
            throw new InvalidOperationException($"Voyage embeddings failed: {(int)res.StatusCode} {body}");

        var parsed = JsonSerializer.Deserialize<VoyageEmbeddingResponse>(body, JsonOpts)
                     ?? throw new InvalidOperationException("Voyage embeddings returned an empty payload.");
        if (parsed.Data is null || parsed.Data.Count != texts.Count)
            throw new InvalidOperationException("Voyage embeddings count mismatch.");

        var vectors = parsed.Data.OrderBy(d => d.Index).Select(d => d.Embedding.ToArray()).ToList();
        var dim = vectors.Count > 0 ? vectors[0].Length : 0;
        _logger.LogInformation(
            "Voyage embeddings: batchSize={Count}, model={Model}, vectorDimension={Dim}",
            texts.Count,
            _options.EmbeddingModel,
            dim);
        return vectors;
    }

    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    private sealed class VoyageEmbeddingRequest
    {
        [JsonPropertyName("model")]
        public string Model { get; set; } = string.Empty;

        [JsonPropertyName("input")]
        public List<string> Input { get; set; } = new();
    }

    private sealed class VoyageEmbeddingResponse
    {
        [JsonPropertyName("data")]
        public List<VoyageEmbeddingItem> Data { get; set; } = new();
    }

    private sealed class VoyageEmbeddingItem
    {
        [JsonPropertyName("index")]
        public int Index { get; set; }

        [JsonPropertyName("embedding")]
        public List<float> Embedding { get; set; } = new();
    }
}
