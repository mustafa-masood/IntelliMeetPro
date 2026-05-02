namespace IntelliMeet.Backend.Options;

public sealed class GroqOptions
{
    public const string SectionName = "Groq";

    /// <summary>API key from https://console.groq.com — use environment <c>Groq__ApiKey</c> or user secrets.</summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>OpenAI-compatible base URL for the Groq API.</summary>
    public string BaseUrl { get; set; } = "https://api.groq.com/openai/v1/";

    /// <summary>OpenAI-compatible chat model id (see Groq docs).</summary>
    public string Model { get; set; } = "llama-3.3-70b-versatile";

    /// <summary>When true, attempt Groq analysis after Meeting BaaS transcription webhooks / bot completed (best-effort).</summary>
    public bool AutoAnalyzeAfterTranscript { get; set; }
}
