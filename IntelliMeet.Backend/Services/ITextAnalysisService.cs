using IntelliMeet.Backend.Models;

namespace IntelliMeet.Backend.Services
{
    public interface ITextAnalysisService
    {
        Task<AnalysisResult> AnalyzeAsync(TranscriptResult transcript, CancellationToken ct = default);
    }
}
