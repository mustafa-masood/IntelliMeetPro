namespace IntelliMeet.Backend.Models
{
    public class MeetingAnalysisResponse
    {
        public TranscriptResult Transcript { get; set; } = new();
        public AnalysisResult Analysis { get; set; } = new();
    }
}
