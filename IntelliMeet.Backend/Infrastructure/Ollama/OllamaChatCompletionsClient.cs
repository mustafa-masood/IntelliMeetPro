using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Infrastructure.Ollama;

public sealed class OllamaChatCompletionsClient : IOllamaChatCompletionsClient
{
    private readonly HttpClient _http;
    private readonly OllamaOptions _options;
    private readonly ILogger<OllamaChatCompletionsClient> _logger;

    public OllamaChatCompletionsClient(HttpClient http, IOptions<OllamaOptions> options, ILogger<OllamaChatCompletionsClient> logger)
    {
        _http = http;
        _logger = logger;
        _options = options.Value;
        var baseUrl = _options.BaseUrl.TrimEnd('/');
        if (!Uri.TryCreate(baseUrl + "/", UriKind.Absolute, out var root))
            throw new InvalidOperationException("Ollama:BaseUrl is invalid.");
        _http.BaseAddress = root;
    }

    public async Task<string> CompleteAsync(string systemMessage, string userMessage, CancellationToken ct)
    {
        var body = new ChatCompletionRequest
        {
            Model = _options.Model,
            Temperature = 0.2,
            Stream = false,
            Messages =
            [
                new ChatMessage { Role = "system", Content = systemMessage },
                new ChatMessage { Role = "user", Content = userMessage }
            ]
        };

        var json = JsonSerializer.Serialize(body, SerializerOptions);
        var perAttemptSeconds = Math.Clamp(_options.ChatTimeoutSeconds, 15, 600);
        var maxRetries = Math.Clamp(_options.ChatMaxRetries, 0, 5);
        var baseDelayMs = Math.Clamp(_options.ChatRetryBaseDelayMs, 50, 30_000);

        Exception? last = null;
        for (var attempt = 0; attempt <= maxRetries; attempt++)
        {
            if (attempt > 0)
            {
                var delay = TimeSpan.FromMilliseconds(baseDelayMs * Math.Pow(2, attempt - 1));
                _logger.LogInformation("Ollama chat retry {Attempt}/{Max} after {Delay}", attempt, maxRetries, delay);
                await Task.Delay(delay, ct).ConfigureAwait(false);
            }

            using var attemptCts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            attemptCts.CancelAfter(TimeSpan.FromSeconds(perAttemptSeconds));
            var sw = Stopwatch.StartNew();
            try
            {
                using var content = new StringContent(json, Encoding.UTF8, "application/json");
                using var resp = await _http.PostAsync("v1/chat/completions", content, attemptCts.Token).ConfigureAwait(false);
                var raw = await resp.Content.ReadAsStringAsync(attemptCts.Token).ConfigureAwait(false);
                sw.Stop();
                if (!resp.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Ollama chat HTTP {Code} in {Ms}ms: {Body}", (int)resp.StatusCode, sw.ElapsedMilliseconds,
                        raw.Length > 500 ? raw[..500] : raw);
                    var detail = TryExtractOllamaErrorMessage(raw) ?? raw.Trim();
                    if (detail.Length > 400)
                        detail = detail[..400] + "…";
                    last = new InvalidOperationException(
                        $"Ollama chat request failed ({(int)resp.StatusCode}). Model '{_options.Model}'. {detail}");
                    continue;
                }

                try
                {
                    var parsed = ParseChoicesContent(raw);
                    _logger.LogInformation("Ollama chat OK in {Ms}ms (model {Model})", sw.ElapsedMilliseconds, _options.Model);
                    return parsed;
                }
                catch (Exception ex) when (ex is not InvalidOperationException)
                {
                    _logger.LogError(ex, "Ollama chat parse failed. Snippet: {Snippet}", raw.Length > 400 ? raw[..400] : raw);
                    last = new InvalidOperationException("Could not parse Ollama chat completion JSON.");
                }
            }
            catch (OperationCanceledException ex) when (!ct.IsCancellationRequested)
            {
                sw.Stop();
                _logger.LogWarning(ex, "Ollama chat timed out after {Ms}ms (per-attempt limit {Seconds}s)", sw.ElapsedMilliseconds, perAttemptSeconds);
                last = new InvalidOperationException(
                    $"Ollama chat timed out after {perAttemptSeconds}s (model '{_options.Model}').");
            }
            catch (Exception ex)
            {
                sw.Stop();
                _logger.LogWarning(ex, "Ollama chat failed after {Ms}ms", sw.ElapsedMilliseconds);
                last = ex;
            }
        }

        throw last ?? new InvalidOperationException("Ollama chat failed.");
    }

    private string ParseChoicesContent(string raw)
    {
        using var doc = JsonDocument.Parse(raw);
        var root = doc.RootElement;
        if (!root.TryGetProperty("choices", out var choices) || choices.ValueKind != JsonValueKind.Array || choices.GetArrayLength() == 0)
            throw new InvalidOperationException("Ollama response missing choices.");
        var first = choices[0];
        if (!first.TryGetProperty("message", out var msg))
            throw new InvalidOperationException("Ollama response missing message.");
        if (!msg.TryGetProperty("content", out var contentEl) || contentEl.ValueKind != JsonValueKind.String)
            throw new InvalidOperationException("Ollama response missing string content.");
        return contentEl.GetString() ?? string.Empty;
    }

    private static string? TryExtractOllamaErrorMessage(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return null;
        try
        {
            using var doc = JsonDocument.Parse(raw);
            var root = doc.RootElement;
            if (root.TryGetProperty("error", out var err))
            {
                if (err.ValueKind == JsonValueKind.String)
                    return err.GetString();
                if (err.TryGetProperty("message", out var m) && m.ValueKind == JsonValueKind.String)
                    return m.GetString();
            }
        }
        catch
        {
            /* ignore */
        }

        return null;
    }

    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private sealed class ChatCompletionRequest
    {
        public string Model { get; set; } = string.Empty;
        public double Temperature { get; set; }
        public bool Stream { get; set; }
        public List<ChatMessage> Messages { get; set; } = new();
    }

    private sealed class ChatMessage
    {
        public string Role { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
}
