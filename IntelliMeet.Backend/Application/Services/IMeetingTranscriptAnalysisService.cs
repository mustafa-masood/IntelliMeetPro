namespace IntelliMeet.Backend.Application.Services;

public interface IMeetingTranscriptAnalysisService
{
    /// <summary>Resolves transcript text, calls Ollama, persists summary / key points / action items.</summary>
    Task AnalyzeAndPersistAsync(Guid meetingId, bool force, CancellationToken ct);
}
