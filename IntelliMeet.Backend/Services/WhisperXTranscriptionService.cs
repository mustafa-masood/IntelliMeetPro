using IntelliMeet.Backend.Models;
using IntelliMeet.Backend.Models.WhisperX;
using IntelliMeet.Backend.Services;
using System.Net.Http.Headers;
using System.Text.Json;

public class WhisperXTranscriptionService : ITranscriptionService
{
    private readonly HttpClient _httpClient;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web);

    public WhisperXTranscriptionService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri("http://localhost:8000");
    }

    public async Task<TranscriptResult> TranscribeAsync(
        IFormFile file,
        CancellationToken cancellationToken = default)
    {
        using var content = new MultipartFormDataContent();

        var fileContent = new StreamContent(file.OpenReadStream());
        fileContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);
        content.Add(fileContent, "file", file.FileName);

        var response = await _httpClient.PostAsync("/transcribe", content, cancellationToken);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        var whisperResponse = JsonSerializer.Deserialize<WhisperXResponse>(json, _jsonOptions);

        if (whisperResponse == null)
            throw new InvalidOperationException("Failed to deserialize WhisperX response");

        return new TranscriptResult
        {
            FullText = whisperResponse.Transcript,
            Segments = whisperResponse.Segments.Select(s => new TranscriptSegment
            {
                Speaker = s.Speaker,
                Text = s.Text,
                Start = s.Start,
                End = s.End
            }).ToList()
        };
    }
}
