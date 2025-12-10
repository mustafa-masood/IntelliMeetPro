using IntelliMeet.Backend.Models;
namespace IntelliMeet.Backend.Services
{
    public interface ITranscriptionService
    {
        Task<TranscriptResult> TranscribeAsync(IFormFile file, CancellationToken cancellationToken = default);
    }
}
