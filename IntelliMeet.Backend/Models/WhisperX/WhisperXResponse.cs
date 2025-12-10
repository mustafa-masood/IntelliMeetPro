namespace IntelliMeet.Backend.Models.WhisperX
{
    public class WhisperXResponse
    {
        public string Language { get; set; } = string.Empty;
        public string Transcript { get; set; } = string.Empty;
        public List<WhisperXSegment> Segments { get; set; } = new();
        public double Duration { get; set; }
    }
}
