using System.Text.Json;
using System.Text.Json.Serialization;
using IntelliMeet.Backend.Infrastructure.Ollama;
using IntelliMeet.Backend.Models;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Services;

/// <summary>Upload / WhisperX path: analyzes plain transcript text via local Ollama <c>/v1/chat/completions</c> (same stack as meeting transcript analysis).</summary>
public sealed class OllamaTextAnalysisService : ITextAnalysisService
{
    private readonly IOllamaChatCompletionsClient _ollama;
    private readonly OllamaOptions _options;
    private readonly ILogger<OllamaTextAnalysisService> _logger;

    public OllamaTextAnalysisService(
        IOllamaChatCompletionsClient ollama,
        IOptions<OllamaOptions> options,
        ILogger<OllamaTextAnalysisService> logger)
    {
        _ollama = ollama;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<AnalysisResult> AnalyzeAsync(TranscriptResult transcript, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.BaseUrl) || string.IsNullOrWhiteSpace(_options.Model))
            throw new InvalidOperationException("Configure Ollama:BaseUrl and Ollama:Model for local LLM analysis.");

        var system = BuildSystemPrompt();
        var user = "TRANSCRIPT:\n\n" + (transcript.FullText ?? string.Empty).Trim();

        var raw = await _ollama.CompleteAsync(system, user, ct).ConfigureAwait(false);
        var json = UnwrapMarkdownFence(raw);
        var analysis = TryDeserialize(json);
        if (analysis is null)
        {
            _logger.LogWarning("Ollama upload-analysis JSON parse failed; retrying with stricter prompt.");
            raw = await _ollama.CompleteAsync(BuildRetrySystemPrompt(), user, ct).ConfigureAwait(false);
            json = UnwrapMarkdownFence(raw);
            analysis = TryDeserialize(json);
        }

        if (analysis is null)
            throw new InvalidOperationException("Ollama returned JSON that could not be parsed as analysis output.");

        analysis.Summary ??= string.Empty;
        analysis.KeyPoints ??= new List<string>();
        analysis.ActionItems ??= new List<IntelliMeet.Backend.Models.ActionItem>();
        analysis.KeyTakeaways ??= new List<string>();
        return analysis;
    }

    private static string BuildSystemPrompt() =>
        """
        You are an assistant that analyzes meeting transcripts.
        Return ONLY a valid JSON object (no markdown fences, no commentary) with EXACTLY these camelCase fields:
        {
          "summary": "string",
          "keyPoints": ["string"],
          "actionItems": [
            {
              "description": "string",
              "owner": "string or null",
              "dueDate": "string or null",
              "priority": "string or null"
            }
          ],
          "keyTakeaways": ["string"]
        }
        Rules:
        - If unsure for owner, dueDate, or priority, use null.
        - summary: 3–6 sentences.
        - keyPoints: 3–10 short bullets.
        - keyTakeaways: 3–7 high-level insights.
        - actionItems: only clear tasks; use empty array if none.
        """;

    private static string BuildRetrySystemPrompt() =>
        BuildSystemPrompt()
        + "\n\nSTRICT_RETRY: Output ONLY compact JSON. No trailing commas. Use null not the word null in quotes for missing values.";

    private static string UnwrapMarkdownFence(string content)
    {
        var t = content.Trim();
        if (!t.StartsWith("```", StringComparison.Ordinal))
            return t;
        var firstNl = t.IndexOf('\n');
        var last = t.LastIndexOf("```", StringComparison.Ordinal);
        if (firstNl < 0 || last <= firstNl)
            return t;
        return t[(firstNl + 1)..last].Trim();
    }

    private static AnalysisResult? TryDeserialize(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<AnalysisResult>(json, JsonOptions);
        }
        catch
        {
            return null;
        }
    }

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };
}
