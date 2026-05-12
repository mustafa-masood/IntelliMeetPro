using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.Integration;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.Services;

public sealed class MeetingBaasStateSynchronizer : IMeetingBaasStateSynchronizer
{
    private readonly IMeetingBotRepository _bots;
    private readonly IMeetingRepository _meetings;
    private readonly IMeetingBaasClient _mb;
    private readonly IMeetingBaasArtifactApplier _artifacts;
    private readonly ITranscriptAnalysisBackgroundTrigger _analysisTrigger;
    private readonly ITranscriptTextResolver _transcriptText;
    private readonly IMeetingFlowCoordinationStore _flowCoordination;
    private readonly ILogger<MeetingBaasStateSynchronizer> _logger;

    public MeetingBaasStateSynchronizer(
        IMeetingBotRepository bots,
        IMeetingRepository meetings,
        IMeetingBaasClient mb,
        IMeetingBaasArtifactApplier artifacts,
        ITranscriptAnalysisBackgroundTrigger analysisTrigger,
        ITranscriptTextResolver transcriptText,
        IMeetingFlowCoordinationStore flowCoordination,
        ILogger<MeetingBaasStateSynchronizer> logger)
    {
        _bots = bots;
        _meetings = meetings;
        _mb = mb;
        _artifacts = artifacts;
        _analysisTrigger = analysisTrigger;
        _transcriptText = transcriptText;
        _flowCoordination = flowCoordination;
        _logger = logger;
    }

    public async Task SyncMeetingAsync(Guid meetingId, string source, CancellationToken ct)
    {
        var shouldConsiderAnalysis = false;
        foreach (var bot in _bots.GetByMeetingId(meetingId))
        {
            if (string.IsNullOrWhiteSpace(bot.ExternalBotId))
                continue;
            try
            {
                var wasCompleted = bot.Status == BotOperationalStatus.Completed;

                var st = await _mb.GetBotStatusAsync(bot.ExternalBotId, ct).ConfigureAwait(false);
                if (!st.Success || st.Data is null)
                    continue;

                var now = DateTimeOffset.UtcNow;
                var meetingForBot = _meetings.GetById(meetingId);
                var previousBotStatus = bot.Status;
                var previousTxStatus = bot.TranscriptionStatus;
                MeetingDomainStateMachine.ApplyMappedBotStatus(
                    bot,
                    meetingForBot,
                    BotStatusMapper.FromMeetingBaas(st.Data.Status),
                    BotStatusMapper.TranscriptionFromMeetingBaas(st.Data.TranscriptionStatus),
                    now);
                _bots.Upsert(bot);
                if (meetingForBot is not null)
                    _meetings.Upsert(meetingForBot);
                _logger.LogInformation(
                    "SyncMeeting source={Source} meeting={MeetingId} bot={BotId} status {PrevBot}->{NewBot} tx {PrevTx}->{NewTx}",
                    source,
                    meetingId,
                    bot.ExternalBotId,
                    previousBotStatus,
                    bot.Status,
                    previousTxStatus,
                    bot.TranscriptionStatus);

                if (!ShouldFetchFullBotDetails(st.Data.Status))
                    continue;

                var details = await _mb.GetBotAsync(bot.ExternalBotId, ct).ConfigureAwait(false);
                if (!details.Success || details.Data is null)
                    continue;

                ApplyMeetingAndBotFromBotDetails(meetingId, bot, details.Data);
                var urlsNew = _artifacts.ApplyFromBotDetails(meetingId, details.Data);
                var transitioned = !wasCompleted && bot.Status == BotOperationalStatus.Completed;
                if (urlsNew || transitioned)
                    shouldConsiderAnalysis = true;
            }
            catch (Exception ex)
            {
                _logger.LogDebug(ex, "Skip Meeting BaaS sync for bot {BotId}", bot.ExternalBotId);
            }
        }

        if (!shouldConsiderAnalysis)
            return;

        var meeting = _meetings.GetById(meetingId);
        if (meeting is null)
            return;

        string? plain = null;
        try
        {
            plain = await _transcriptText.ResolvePlainTextAsync(meetingId, ct).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Transcript resolve skipped during sync for meeting {MeetingId}", meetingId);
        }

        var anyCompletedBot = _bots.GetByMeetingId(meetingId).Any(b => b.Status == BotOperationalStatus.Completed);
        if (anyCompletedBot && string.IsNullOrWhiteSpace(plain))
        {
            MeetingDomainStateMachine.MarkAwaitingTranscript(meeting, DateTimeOffset.UtcNow);
            _meetings.Upsert(meeting);
            return;
        }

        if (!string.IsNullOrWhiteSpace(plain) && !meeting.TranscriptAnalysisCompleted)
            _analysisTrigger.EnqueueIfEnabled(meetingId);

        if (string.Equals(source, "webhook", StringComparison.OrdinalIgnoreCase))
            _flowCoordination.MarkWebhookTouch(meetingId, DateTimeOffset.UtcNow);
    }

    private void ApplyMeetingAndBotFromBotDetails(Guid meetingId, MeetingBot bot, BotDetailsData d)
    {
        var s = d.Status?.ToLowerInvariant();
        if (s == "completed")
        {
            var m = _meetings.GetById(meetingId);
            MeetingDomainStateMachine.MarkBotCompleted(bot, m, DateTimeOffset.UtcNow);
            if (m is not null) _meetings.Upsert(m);
        }
        else if (s == "failed")
        {
            var m = _meetings.GetById(meetingId);
            MeetingDomainStateMachine.MarkBotFailed(bot, m, DateTimeOffset.UtcNow);
            if (m is not null) _meetings.Upsert(m);
        }
        else if (s == "transcribing")
        {
            bot.Status = BotOperationalStatus.Transcribing;
            bot.TranscriptionStatus = TranscriptStatus.Processing;
        }

        bot.UpdatedAt = DateTimeOffset.UtcNow;
        _bots.Upsert(bot);
    }

    private static bool ShouldFetchFullBotDetails(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
            return false;
        return status.ToLowerInvariant() switch
        {
            "completed" or "transcribing" or "failed" or "call_ended" or "recording_succeeded" => true,
            _ => false
        };
    }
}
