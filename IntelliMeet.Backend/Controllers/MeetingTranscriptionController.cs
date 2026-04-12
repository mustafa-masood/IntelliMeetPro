using IntelliMeet.Backend.Models;
using IntelliMeet.Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace IntelliMeet.Backend.Controllers;

/// <summary>Legacy WhisperX + Ollama analysis endpoints (file upload). Kept for existing frontend.</summary>
[ApiController]
[Route("api/meetings")]
public class MeetingTranscriptionController : ControllerBase
{
    private readonly ITranscriptionService _transcriptionService;
    private readonly ITextAnalysisService _textAnalysisService;

    public MeetingTranscriptionController(
        ITranscriptionService transcriptionService,
        ITextAnalysisService textAnalysisService)
    {
        _transcriptionService = transcriptionService;
        _textAnalysisService = textAnalysisService;
    }

    [HttpPost("analyzeWithTranscription")]
    public async Task<ActionResult<MeetingAnalysisResponse>> AnalyzeWithTranscription(
        [FromForm] AnalyzeRequest request,
        CancellationToken ct)
    {
        if (request.File == null || request.File.Length == 0)
            return BadRequest("File is required.");

        var transcript = await _transcriptionService.TranscribeAsync(request.File, ct);
        var analysis = await _textAnalysisService.AnalyzeAsync(transcript, ct);
        return Ok(new MeetingAnalysisResponse { Transcript = transcript, Analysis = analysis });
    }

    [HttpPost("analyze")]
    public ActionResult<MeetingAnalysisResponse> AnalyzeMock()
    {
        var mockResponse = new MeetingAnalysisResponse
        {
            Transcript = new TranscriptResult
            {
                FullText = "This is a mock transcript.",
                Segments =
                {
                    new TranscriptSegment
                    {
                        Speaker = "SPEAKER_1",
                        Text = "Hello, thanks for joining.",
                        Start = 0,
                        End = 5
                    }
                }
            },
            Analysis = new AnalysisResult
            {
                Summary = "This is a mock summary.",
                KeyPoints = { "Mock key point 1", "Mock key point 2" },
                ActionItems =
                {
                    new ActionItem
                    {
                        Description = "Mock action item",
                        Owner = "Alice",
                        DueDate = "2025-12-31",
                        Priority = "High"
                    }
                },
                KeyTakeaways = { "Mock takeaway 1" }
            }
        };
        return Ok(mockResponse);
    }
}
