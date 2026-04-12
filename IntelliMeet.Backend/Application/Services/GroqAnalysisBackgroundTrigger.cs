using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Application.Services;

public sealed class GroqAnalysisBackgroundTrigger : IGroqAnalysisBackgroundTrigger
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IOptionsMonitor<GroqOptions> _groqOpt;
    private readonly ILogger<GroqAnalysisBackgroundTrigger> _logger;

    public GroqAnalysisBackgroundTrigger(
        IServiceScopeFactory scopeFactory,
        IOptionsMonitor<GroqOptions> groqOpt,
        ILogger<GroqAnalysisBackgroundTrigger> logger)
    {
        _scopeFactory = scopeFactory;
        _groqOpt = groqOpt;
        _logger = logger;
    }

    public void EnqueueIfEnabled(Guid meetingId)
    {
        var opt = _groqOpt.CurrentValue;
        if (!opt.AutoAnalyzeAfterTranscript || string.IsNullOrWhiteSpace(opt.ApiKey))
            return;

        _ = Task.Run(async () =>
        {
            try
            {
                await using var scope = _scopeFactory.CreateAsyncScope();
                var svc = scope.ServiceProvider.GetRequiredService<IMeetingGroqAnalysisService>();
                await svc.AnalyzeAndPersistAsync(meetingId, CancellationToken.None).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Background Groq analysis failed for meeting {MeetingId}", meetingId);
            }
        });
    }
}
