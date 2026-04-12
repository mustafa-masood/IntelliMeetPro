namespace IntelliMeet.Backend.Application.Services;

public interface ITranscriptTextResolver
{
    /// <summary>Best-effort plain text for LLM: RawText, segments, Meeting BaaS URL fetch, or fresh bot details.</summary>
    Task<string?> ResolvePlainTextAsync(Guid meetingId, CancellationToken ct);
}
