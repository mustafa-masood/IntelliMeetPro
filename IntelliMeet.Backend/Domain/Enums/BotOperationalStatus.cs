namespace IntelliMeet.Backend.Domain.Enums;

/// <summary>Normalized bot state; maps from Meeting BaaS <c>bot.status</c> strings where applicable.</summary>
public enum BotOperationalStatus
{
    Unknown = 0,
    Queued = 1,
    JoiningCall = 2,
    InWaitingRoom = 3,
    InCallNotRecording = 4,
    InCallRecording = 5,
    RecordingPaused = 6,
    RecordingResumed = 7,
    Transcribing = 8,
    Completed = 9,
    Failed = 10,
    ScheduledPending = 11,
    Removed = 12
}
