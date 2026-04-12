namespace IntelliMeet.Backend.Application.Services;

public interface IMeetingGroqAnalysisService
{
    /// <summary>Resolves transcript text, calls Groq, persists summary / key points / Groq action items.</summary>
    Task AnalyzeAndPersistAsync(Guid meetingId, CancellationToken ct);
}
