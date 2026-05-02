using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Infrastructure.Groq;

public sealed class GroqChatService : IGroqChatService
{
    private readonly HttpClient _http;
    private readonly GroqOptions _opt;
    private readonly ILogger<GroqChatService> _logger;

    public GroqChatService(HttpClient http, IOptions<GroqOptions> opt, ILogger<GroqChatService> logger)
    {
        _http = http;
        _opt = opt.Value;
        _logger = logger;
        _http.BaseAddress = new Uri(_opt.BaseUrl.TrimEnd('/') + "/");
        _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<string> CompleteJsonAsync(string systemPrompt, string userContent, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_opt.ApiKey))
            throw new InvalidOperationException("Groq API key is not configured (Groq:ApiKey or Groq__ApiKey).");

        using var request = new HttpRequestMessage(HttpMethod.Post, "chat/completions");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _opt.ApiKey.Trim());

        var chatRequest = new GroqChatRequest
        {
            Model = string.IsNullOrWhiteSpace(_opt.Model) ? "llama-3.3-70b-versatile" : _opt.Model.Trim(),
            Temperature = 0.2,
            Messages =
            [
                new GroqChatMessage { Role = "system", Content = systemPrompt },
                new GroqChatMessage { Role = "user", Content = userContent }
            ],
            ResponseFormat = new GroqResponseFormat { Type = "json_object" }
        };

        var serializedBody = JsonSerializer.Serialize(chatRequest, GroqJson.Serialize);
        request.Content = new StringContent(serializedBody, Encoding.UTF8, "application/json");

        using var response = await _http.SendAsync(request, ct).ConfigureAwait(false);
        var responseText = await response.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Groq API error {Status}: {Body}", (int)response.StatusCode, responseText.Length > 500 ? responseText[..500] : responseText);
            throw new InvalidOperationException($"Groq request failed ({(int)response.StatusCode}).");
        }

        GroqChatCompletionResponse? completion;
        try
        {
            completion = JsonSerializer.Deserialize<GroqChatCompletionResponse>(responseText, GroqJson.Deserialize);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Groq response parse failed");
            throw new InvalidOperationException("Groq returned an unexpected response shape.");
        }

        var content = completion?.Choices?.FirstOrDefault()?.Message?.Content;
        if (string.IsNullOrWhiteSpace(content))
            throw new InvalidOperationException("Groq returned empty content.");

        return content.Trim();
    }

    private sealed class GroqJson
    {
        public static readonly JsonSerializerOptions Serialize = new()
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public static readonly JsonSerializerOptions Deserialize = new()
        {
            PropertyNameCaseInsensitive = true
        };
    }

    private sealed class GroqChatRequest
    {
        [JsonPropertyName("model")]
        public string Model { get; set; } = string.Empty;

        [JsonPropertyName("messages")]
        public List<GroqChatMessage> Messages { get; set; } = [];

        [JsonPropertyName("temperature")]
        public double Temperature { get; set; }

        [JsonPropertyName("response_format")]
        public GroqResponseFormat ResponseFormat { get; set; } = new();
    }

    private sealed class GroqResponseFormat
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = "json_object";
    }

    private sealed class GroqChatMessage
    {
        [JsonPropertyName("role")]
        public string Role { get; set; } = string.Empty;

        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty;
    }

    private sealed class GroqChatCompletionResponse
    {
        [JsonPropertyName("choices")]
        public List<GroqChoice>? Choices { get; set; }
    }

    private sealed class GroqChoice
    {
        [JsonPropertyName("message")]
        public GroqAssistantMessage? Message { get; set; }
    }

    private sealed class GroqAssistantMessage
    {
        [JsonPropertyName("content")]
        public string? Content { get; set; }
    }
}
