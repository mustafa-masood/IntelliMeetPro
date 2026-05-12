namespace IntelliMeet.Backend.Application.Abstractions;

/// <summary>Fire-and-forget Ollama meeting analysis when <see cref="Options.OllamaOptions.AutoAnalyzeAfterTranscript"/> is enabled.</summary>
public interface ITranscriptAnalysisBackgroundTrigger
{
    void EnqueueIfEnabled(Guid meetingId);
}
