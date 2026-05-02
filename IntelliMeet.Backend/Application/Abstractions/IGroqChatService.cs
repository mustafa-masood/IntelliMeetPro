namespace IntelliMeet.Backend.Application.Abstractions;

public interface IGroqChatService
{
    /// <summary>Sends system + user messages to the configured LLM and returns the assistant response (expected JSON only).</summary>
    Task<string> CompleteJsonAsync(string systemPrompt, string userContent, CancellationToken ct);
}
