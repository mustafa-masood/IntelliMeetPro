namespace IntelliMeet.Backend.Models
{
    public class ActionItem
    {
        public string Description { get; set; } = string.Empty;
        public string? Owner { get; set; }
        public string? DueDate { get; set; }  // later can convert to DateTime
        public string? Priority { get; set; }
    }
}
