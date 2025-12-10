namespace IntelliMeet.Backend.Models
{
    public class TranscriptResult
    {
        public string FullText { get; set; } = string.Empty;
        public List<TranscriptSegment> Segments { get; set; } = new();
    }
}
