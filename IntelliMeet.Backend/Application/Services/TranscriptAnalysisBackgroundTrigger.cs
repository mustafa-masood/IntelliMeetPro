using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Application.Services;

public sealed class TranscriptAnalysisBackgroundTrigger : ITranscriptAnalysisBackgroundTrigger
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IOptionsMonitor<OllamaOptions> _ollamaOpt;
    private readonly ILogger<TranscriptAnalysisBackgroundTrigger> _logger;

    public TranscriptAnalysisBackgroundTrigger(
        IServiceScopeFactory scopeFactory,
        IOptionsMonitor<OllamaOptions> ollamaOpt,
        ILogger<TranscriptAnalysisBackgroundTrigger> logger)
    {
        _scopeFactory = scopeFactory;
        _ollamaOpt = ollamaOpt;
        _logger = logger;
    }

    public void EnqueueIfEnabled(Guid meetingId)
    {
        var opt = _ollamaOpt.CurrentValue;
        if (!opt.AutoAnalyzeAfterTranscript)
            return;
        if (string.IsNullOrWhiteSpace(opt.BaseUrl) || string.IsNullOrWhiteSpace(opt.Model))
        {
            _logger.LogDebug("Ollama auto-analyze skipped: BaseUrl or Model not configured.");
            return;
        }

        _ = Task.Run(async () =>
        {
            try
            {
                await using var scope = _scopeFactory.CreateAsyncScope();
                var svc = scope.ServiceProvider.GetRequiredService<IMeetingTranscriptAnalysisService>();
                await svc.AnalyzeAndPersistAsync(meetingId, force: false, CancellationToken.None).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Background Ollama analysis failed for meeting {MeetingId}", meetingId);
            }
        });
    }
}
