// Services/OllamaTextAnalysisService.cs
using System.Text;
using System.Text.Json;
using IntelliMeet.Backend.Models;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Services
{
    public class OllamaTextAnalysisService : ITextAnalysisService
    {
        private readonly HttpClient _httpClient;
        private readonly OllamaOptions _options;
        private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web);

        public OllamaTextAnalysisService(HttpClient httpClient, IOptions<OllamaOptions> options)
        {
            _options = options.Value;
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri(_options.BaseUrl);
        }

        public async Task<AnalysisResult> AnalyzeAsync(TranscriptResult transcript, CancellationToken ct = default)
        {
            var systemInstructions = @"You are an assistant that analyzes meeting transcripts.
Return a STRICT JSON object with this exact C#-compatible structure (camelCase properties):

{
  ""summary"": string,
  ""keyPoints"": string[],
  ""actionItems"": [
    {
      ""description"": string,
      ""owner"": string | null,
      ""dueDate"": string | null,
      ""priority"": string | null
    }
  ],
  ""keyTakeaways"": string[]
}

Rules:
- Do NOT include any explanation or text outside the JSON.
- If you are unsure for owner, dueDate, or priority, use null.
- Make summary concise (3–6 sentences).
- keyPoints: 3–10 short bullet-style strings.
- keyTakeaways: 3–7 high-level insights.";

            var userPrompt = $@"
{systemInstructions}

Here is the meeting transcript:

{transcript.FullText}
";

            var requestBody = new
            {
                model = _options.Model,
                prompt = userPrompt,
                stream = false
            };

            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");

            var response = await _httpClient.PostAsync("/api/generate", content, ct);
            var raw = await response.Content.ReadAsStringAsync(ct);
            Console.WriteLine("Ollama raw response: " + raw);

            response.EnsureSuccessStatusCode();

            using var doc = JsonDocument.Parse(raw);
            var responseText = doc.RootElement.GetProperty("response").GetString();

            if (string.IsNullOrWhiteSpace(responseText))
                throw new InvalidOperationException("Ollama returned empty response text.");

            // Best effort: trim any leading/trailing text around JSON
            var jsonStart = responseText.IndexOf('{');
            var jsonEnd = responseText.LastIndexOf('}');
            if (jsonStart >= 0 && jsonEnd > jsonStart)
            {
                responseText = responseText.Substring(jsonStart, jsonEnd - jsonStart + 1);
            }

            var analysis = JsonSerializer.Deserialize<AnalysisResult>(responseText, _jsonOptions);
            if (analysis == null)
                throw new InvalidOperationException("Failed to deserialize Ollama analysis JSON.");

            return analysis;
        }
    }
}
