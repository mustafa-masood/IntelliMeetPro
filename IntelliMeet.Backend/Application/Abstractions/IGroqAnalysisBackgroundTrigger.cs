namespace IntelliMeet.Backend.Application.Abstractions;

/// <summary>Fire-and-forget Groq meeting analysis when <see cref="Options.GroqOptions.AutoAnalyzeAfterTranscript"/> is enabled.</summary>
public interface IGroqAnalysisBackgroundTrigger
{
    void EnqueueIfEnabled(Guid meetingId);
}
