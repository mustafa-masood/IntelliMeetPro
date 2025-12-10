namespace IntelliMeet.Backend.Models.WhisperX
{
    public class WhisperXSegment
    {
        public string Speaker { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public double Start { get; set; }
        public double End { get; set; }
    }
}
