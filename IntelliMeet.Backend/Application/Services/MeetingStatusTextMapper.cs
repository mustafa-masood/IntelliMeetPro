using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.Services;

public static class MeetingStatusTextMapper
{
    public static string BotStatus(BotOperationalStatus status) => status switch
    {
        BotOperationalStatus.Queued => "Bot pending",
        BotOperationalStatus.JoiningCall => "Bot joining",
        BotOperationalStatus.InWaitingRoom => "Bot waiting room",
        BotOperationalStatus.InCallNotRecording => "Bot joined",
        BotOperationalStatus.InCallRecording => "Recording in progress",
        BotOperationalStatus.RecordingPaused => "Recording paused",
        BotOperationalStatus.RecordingResumed => "Recording resumed",
        BotOperationalStatus.Transcribing => "Transcript processing",
        BotOperationalStatus.Completed => "Recording complete",
        BotOperationalStatus.Failed => "Bot failed",
        BotOperationalStatus.ScheduledPending => "Bot scheduled",
        BotOperationalStatus.Removed => "Bot removed",
        _ => "Bot status unknown"
    };

    public static string TranscriptStatus(TranscriptStatus status) => status switch
    {
        Domain.Enums.TranscriptStatus.Pending => "Transcript queued",
        Domain.Enums.TranscriptStatus.Processing => "Transcript processing",
        Domain.Enums.TranscriptStatus.Ready => "Transcript ready",
        Domain.Enums.TranscriptStatus.Failed => "Transcript failed",
        _ => "Transcript unavailable"
    };

    public static string ProcessingStatus(MeetingProcessingStatus status) => status switch
    {
        MeetingProcessingStatus.AwaitingMeetingBaasData => "Awaiting MeetingBaaS data",
        MeetingProcessingStatus.AwaitingTranscript => "Awaiting transcript",
        MeetingProcessingStatus.AnalyzingTranscript => "Analyzing transcript",
        MeetingProcessingStatus.AnalysisComplete => "Analysis complete",
        MeetingProcessingStatus.AnalysisFailed => "Analysis failed",
        _ => "Idle"
    };

    public static string LifecycleStatus(MeetingStatus status) => status switch
    {
        MeetingStatus.Scheduled => "Scheduled",
        MeetingStatus.Live => "Live",
        MeetingStatus.Processing => "Processing",
        MeetingStatus.Completed => "Completed",
        MeetingStatus.Failed => "Failed",
        MeetingStatus.Cancelled => "Cancelled",
        _ => "Unknown"
    };
}
