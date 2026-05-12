namespace IntelliMeet.Backend.Options;

public sealed class TrelloOptions
{
    public const string SectionName = "Trello";

    /// <summary>Trello “API key” from developer portal.</summary>
    public string ApiKey { get; set; } = string.Empty;
    /// <summary>Frontend URL that receives #token=… (e.g. http://localhost:5173/integrations/trello/callback).</summary>
    public string ReturnUrl { get; set; } = string.Empty;
    /// <summary>Optional override for authorize base (default builds from ApiKey).</summary>
    public string? AuthUrl { get; set; }

    public string ApiBaseUrl { get; set; } = "https://api.trello.com/1/";
}
