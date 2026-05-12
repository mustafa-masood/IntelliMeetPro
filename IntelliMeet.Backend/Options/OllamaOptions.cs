namespace IntelliMeet.Backend.Options;

/// <summary>Local Ollama only: the backend calls your machine’s Ollama HTTP API (no third-party LLM API keys).</summary>
public sealed class OllamaOptions
{
    public const string SectionName = "Ollama";

    /// <summary>Root URL for Ollama (default <c>http://localhost:11434</c>). If the API runs in Docker and Ollama on the host, try <c>http://host.docker.internal:11434</c>.</summary>
    public string BaseUrl { get; set; } = "http://localhost:11434";

    /// <summary>Model name as understood by <c>/v1/chat/completions</c>.</summary>
    public string Model { get; set; } = "llama3.2";

    /// <summary>When true, run structured analysis after transcript text is available (polling or webhook).</summary>
    public bool AutoAnalyzeAfterTranscript { get; set; } = true;

    /// <summary>HTTP timeout for each chat completion attempt (seconds).</summary>
    public int ChatTimeoutSeconds { get; set; } = 120;

    /// <summary>Retries after the first failed attempt (not counting the initial call).</summary>
    public int ChatMaxRetries { get; set; } = 2;

    /// <summary>Initial delay in milliseconds before the first retry; doubles each retry (exponential backoff).</summary>
    public int ChatRetryBaseDelayMs { get; set; } = 400;
}
