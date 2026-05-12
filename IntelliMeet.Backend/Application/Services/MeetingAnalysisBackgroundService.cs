using Microsoft.Extensions.DependencyInjection;

namespace IntelliMeet.Backend.Application.Services;

/// <summary>Drains the meeting analysis queue so HTTP handlers stay fast.</summary>
public sealed class MeetingAnalysisBackgroundService : BackgroundService
{
    private readonly MeetingAnalysisQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<MeetingAnalysisBackgroundService> _logger;

    public MeetingAnalysisBackgroundService(
        MeetingAnalysisQueue queue,
        IServiceScopeFactory scopeFactory,
        ILogger<MeetingAnalysisBackgroundService> logger)
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var reader = _queue.Reader;
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                if (!await reader.WaitToReadAsync(stoppingToken).ConfigureAwait(false))
                    break;
                while (reader.TryRead(out var work))
                    await ProcessOneAsync(work, stoppingToken).ConfigureAwait(false);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Meeting analysis queue loop error");
                await Task.Delay(1000, stoppingToken).ConfigureAwait(false);
            }
        }
    }

    private async Task ProcessOneAsync(MeetingAnalysisWorkItem work, CancellationToken stoppingToken)
    {
        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var svc = scope.ServiceProvider.GetRequiredService<IMeetingTranscriptAnalysisService>();
            await svc.AnalyzeAndPersistAsync(work.MeetingId, work.Force, stoppingToken).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Queued transcript analysis failed for meeting {MeetingId}", work.MeetingId);
        }
    }
}
