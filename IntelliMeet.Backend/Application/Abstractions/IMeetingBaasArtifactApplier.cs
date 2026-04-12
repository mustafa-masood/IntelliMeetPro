using IntelliMeet.Backend.Application.Integration;

namespace IntelliMeet.Backend.Application.Abstractions;

/// <summary>Maps Meeting BaaS bot details / webhook artifact URLs into <see cref="ITranscriptRepository"/> and <see cref="IRecordingAssetRepository"/>.</summary>
public interface IMeetingBaasArtifactApplier
{
    /// <returns>true if the meeting transcript row gained its first external transcription/diarization URL as a result of this call.</returns>
    bool ApplyFromBotDetails(Guid meetingId, BotDetailsData d);
}
