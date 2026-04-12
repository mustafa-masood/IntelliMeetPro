namespace IntelliMeet.Backend.Infrastructure.Groq;

public interface IGroqChatService
{
    /// <summary>Returns assistant message content (expected JSON only).</summary>
    Task<string> CompleteJsonAsync(string systemPrompt, string userContent, CancellationToken ct);
}
