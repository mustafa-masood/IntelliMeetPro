namespace IntelliMeet.Backend.Infrastructure.Ollama;

public interface IOllamaChatCompletionsClient
{
    /// <summary>OpenAI-compatible chat completion; returns assistant message text (may contain JSON only).</summary>
    Task<string> CompleteAsync(string systemMessage, string userMessage, CancellationToken ct);
}
