namespace IntelliMeet.Backend.Options;

public sealed class VoyageOptions
{
    public const string SectionName = "Voyage";

    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://api.voyageai.com/v1";
    public string EmbeddingModel { get; set; } = "voyage-4-large";
}
