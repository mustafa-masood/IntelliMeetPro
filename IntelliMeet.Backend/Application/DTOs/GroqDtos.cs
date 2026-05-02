using System.Text.Json.Serialization;

namespace IntelliMeet.Backend.Application.DTOs;

public sealed class GroqAnalysisDto
{
    [JsonPropertyName("summary")]
    public string? Summary { get; set; }

    [JsonPropertyName("keyPoints")]
    public List<string>? KeyPoints { get; set; }

    [JsonPropertyName("actionItems")]
    public List<GroqActionItemDto>? ActionItems { get; set; }
}

public sealed class GroqActionItemDto
{
    [JsonPropertyName("owner")]
    public string? Owner { get; set; }

    [JsonPropertyName("task")]
    public string? Task { get; set; }

    [JsonPropertyName("dueDate")]
    public string? DueDate { get; set; }
}
