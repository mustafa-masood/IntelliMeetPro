namespace IntelliMeet.Backend.Models
{
    public class AnalysisResult
    {
        public string Summary { get; set; } = string.Empty;
        public List<string> KeyPoints { get; set; } = new();
        public List<ActionItem> ActionItems { get; set; } = new();
        public List<string> KeyTakeaways { get; set; } = new();
    }
}
