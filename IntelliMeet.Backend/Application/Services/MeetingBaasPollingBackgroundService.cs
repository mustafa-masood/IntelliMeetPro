using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Application.Services;

/// <summary>Polls Meeting BaaS for meetings with bots so localhost works without inbound webhooks.</summary>
public sealed class MeetingBaasPollingBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IOptionsMonitor<MeetingBaasPollingOptions> _pollOpt;
    private readonly IOptionsMonitor<ReliabilityOptions> _reliabilityOpt;
    private readonly ILogger<MeetingBaasPollingBackgroundService> _logger;

    public MeetingBaasPollingBackgroundService(
        IServiceScopeFactory scopeFactory,
        IOptionsMonitor<MeetingBaasPollingOptions> pollOpt,
        IOptionsMonitor<ReliabilityOptions> reliabilityOpt,
        ILogger<MeetingBaasPollingBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _pollOpt = pollOpt;
        _reliabilityOpt = reliabilityOpt;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var opt = _pollOpt.CurrentValue;
            var delay = TimeSpan.FromSeconds(Math.Clamp(opt.IntervalSeconds, 5, 600));
            if (!opt.Enabled)
            {
                await Task.Delay(delay, stoppingToken).ConfigureAwait(false);
                continue;
            }

            try
            {
                await using var scope = _scopeFactory.CreateAsyncScope();
                var sp = scope.ServiceProvider;
                var meetings = sp.GetRequiredService<IMeetingRepository>().GetAll();
                var botsRepo = sp.GetRequiredService<IMeetingBotRepository>();
                var sync = sp.GetRequiredService<IMeetingBaasStateSynchronizer>();
                var flow = sp.GetRequiredService<IMeetingFlowCoordinationStore>();
                var grace = TimeSpan.FromSeconds(Math.Clamp(_reliabilityOpt.CurrentValue.PollingWebhookGraceSeconds, 0, 300));

                foreach (var m in meetings)
                {
                    if (stoppingToken.IsCancellationRequested)
                        break;
                    var bots = botsRepo.GetByMeetingId(m.Id);
                    if (!ShouldPollMeeting(m, bots))
                        continue;
                    if (flow.HasRecentWebhookTouch(m.Id, DateTimeOffset.UtcNow, grace))
                    {
                        _logger.LogDebug("Skipping poll sync for meeting {MeetingId}: recent webhook touch within {GraceSeconds}s", m.Id, grace.TotalSeconds);
                        continue;
                    }
                    try
                    {
                        await sync.SyncMeetingAsync(m.Id, "polling", stoppingToken).ConfigureAwait(false);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogDebug(ex, "Meeting BaaS poll sync failed for meeting {MeetingId}", m.Id);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Meeting BaaS polling iteration failed");
            }

            try
            {
                await Task.Delay(delay, stoppingToken).ConfigureAwait(false);
            }
            catch (TaskCanceledException)
            {
                break;
            }
        }
    }

    private static bool ShouldPollMeeting(Meeting m, IReadOnlyList<MeetingBot> bots)
    {
        var withExt = bots.Where(b => !string.IsNullOrWhiteSpace(b.ExternalBotId)).ToList();
        if (withExt.Count == 0)
            return false;

        if (m.ProcessingStatus == MeetingProcessingStatus.AnalyzingTranscript)
            return false;

        if (withExt.All(b => b.Status == BotOperationalStatus.Failed))
            return false;

        if (m.TranscriptAnalysisCompleted
            && withExt.All(b => b.Status is BotOperationalStatus.Completed or BotOperationalStatus.Failed or BotOperationalStatus.Removed))
            return false;

        return true;
    }
}
