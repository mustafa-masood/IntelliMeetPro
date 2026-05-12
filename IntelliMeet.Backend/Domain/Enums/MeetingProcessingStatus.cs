namespace IntelliMeet.Backend.Domain.Enums;

/// <summary>Post-meeting pipeline state for UI and polling (independent of <see cref="MeetingStatus"/>).</summary>
public enum MeetingProcessingStatus
{
    Idle = 0,
    AwaitingMeetingBaasData = 1,
    AwaitingTranscript = 2,
    AnalyzingTranscript = 3,
    AnalysisComplete = 4,
    AnalysisFailed = 5
}
