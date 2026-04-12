using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.Services;

public static class BotStatusMapper
{
    public static BotOperationalStatus FromMeetingBaas(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
            return BotOperationalStatus.Unknown;
        return status.ToLowerInvariant() switch
        {
            "queued" => BotOperationalStatus.Queued,
            "joining_call" => BotOperationalStatus.JoiningCall,
            "in_waiting_room" => BotOperationalStatus.InWaitingRoom,
            "in_call_not_recording" => BotOperationalStatus.InCallNotRecording,
            "in_call_recording" => BotOperationalStatus.InCallRecording,
            "recording_paused" => BotOperationalStatus.RecordingPaused,
            "recording_resumed" => BotOperationalStatus.RecordingResumed,
            "transcribing" => BotOperationalStatus.Transcribing,
            "completed" => BotOperationalStatus.Completed,
            "failed" => BotOperationalStatus.Failed,
            _ => BotOperationalStatus.Unknown
        };
    }

    public static TranscriptStatus TranscriptionFromMeetingBaas(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
            return TranscriptStatus.None;
        return status.ToLowerInvariant() switch
        {
            "pending" or "queued" => TranscriptStatus.Pending,
            "processing" => TranscriptStatus.Processing,
            "completed" or "ready" => TranscriptStatus.Ready,
            "failed" => TranscriptStatus.Failed,
            _ => TranscriptStatus.Processing
        };
    }
}
