using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.Services;

/// <summary>
/// Canonical meeting/bot/transcript state transitions for Phase 1.
/// Keep all lifecycle mutations here so controllers/services stay consistent.
/// </summary>
public static class MeetingDomainStateMachine
{
    public static void MarkMeetingLive(Meeting meeting, DateTimeOffset now)
    {
        meeting.Status = MeetingStatus.Live;
        meeting.UpdatedAt = now;
    }

    public static void MarkMeetingScheduled(Meeting meeting, DateTimeOffset now)
    {
        meeting.Status = MeetingStatus.Scheduled;
        meeting.UpdatedAt = now;
    }

    public static void MarkMeetingCompleted(Meeting meeting, DateTimeOffset now)
    {
        meeting.Status = MeetingStatus.Completed;
        meeting.UpdatedAt = now;
    }

    public static void MarkMeetingFailed(Meeting meeting, DateTimeOffset now)
    {
        meeting.Status = MeetingStatus.Failed;
        meeting.ProcessingStatus = MeetingProcessingStatus.Idle;
        meeting.UpdatedAt = now;
    }

    public static void MarkAwaitingTranscript(Meeting meeting, DateTimeOffset now)
    {
        meeting.ProcessingStatus = MeetingProcessingStatus.AwaitingTranscript;
        meeting.AnalysisError = null;
        meeting.UpdatedAt = now;
    }

    public static void MarkAnalyzingTranscript(Meeting meeting, DateTimeOffset now)
    {
        meeting.ProcessingStatus = MeetingProcessingStatus.AnalyzingTranscript;
        meeting.AnalysisError = null;
        meeting.UpdatedAt = now;
    }

    public static void MarkAnalysisComplete(Meeting meeting, DateTimeOffset now)
    {
        meeting.TranscriptAnalysisCompleted = true;
        meeting.ProcessingStatus = MeetingProcessingStatus.AnalysisComplete;
        meeting.AnalysisError = null;
        meeting.UpdatedAt = now;
    }

    public static void MarkAnalysisFailed(Meeting meeting, string message, DateTimeOffset now)
    {
        meeting.ProcessingStatus = MeetingProcessingStatus.AnalysisFailed;
        meeting.AnalysisError = message;
        meeting.UpdatedAt = now;
    }

    public static void MarkBotQueued(MeetingBot bot, bool transcriptionEnabled, DateTimeOffset now)
    {
        bot.Status = BotOperationalStatus.Queued;
        bot.TranscriptionStatus = transcriptionEnabled ? TranscriptStatus.Pending : TranscriptStatus.None;
        bot.UpdatedAt = now;
    }

    public static void ApplyMappedBotStatus(
        MeetingBot bot,
        Meeting? meeting,
        BotOperationalStatus mappedBotStatus,
        TranscriptStatus mappedTranscriptStatus,
        DateTimeOffset now)
    {
        bot.Status = mappedBotStatus;
        bot.TranscriptionStatus = mappedTranscriptStatus;
        bot.UpdatedAt = now;

        if (meeting is null)
            return;

        if (mappedBotStatus == BotOperationalStatus.Completed)
            MarkMeetingCompleted(meeting, now);
        else if (mappedBotStatus == BotOperationalStatus.Failed)
            MarkMeetingFailed(meeting, now);
    }

    public static void MarkBotCompleted(MeetingBot bot, Meeting? meeting, DateTimeOffset now)
    {
        bot.Status = BotOperationalStatus.Completed;
        bot.TranscriptionStatus = TranscriptStatus.Ready;
        bot.UpdatedAt = now;
        if (meeting is not null)
            MarkMeetingCompleted(meeting, now);
    }

    public static void MarkBotFailed(MeetingBot bot, Meeting? meeting, DateTimeOffset now)
    {
        bot.Status = BotOperationalStatus.Failed;
        bot.UpdatedAt = now;
        if (meeting is not null)
            MarkMeetingFailed(meeting, now);
    }

    public static void MarkBotTranscriptionReady(MeetingBot bot, DateTimeOffset now)
    {
        bot.TranscriptionStatus = TranscriptStatus.Ready;
        bot.UpdatedAt = now;
    }
}
