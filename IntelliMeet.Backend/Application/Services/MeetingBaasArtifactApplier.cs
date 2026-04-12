using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.Integration;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.Services;

public sealed class MeetingBaasArtifactApplier : IMeetingBaasArtifactApplier
{
    private readonly ITranscriptRepository _transcripts;
    private readonly IRecordingAssetRepository _recordings;

    public MeetingBaasArtifactApplier(ITranscriptRepository transcripts, IRecordingAssetRepository recordings)
    {
        _transcripts = transcripts;
        _recordings = recordings;
    }

    public bool ApplyFromBotDetails(Guid meetingId, BotDetailsData d)
    {
        var tBefore = _transcripts.GetByMeetingId(meetingId);
        var hadArtifactUrl = tBefore is not null
                             && (!string.IsNullOrEmpty(tBefore.ExternalTranscriptionUrl)
                                 || !string.IsNullOrEmpty(tBefore.ExternalRawTranscriptionUrl));

        var now = DateTimeOffset.UtcNow;
        var exp = now.AddHours(3);
        void AddRecording(string kind, string? url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return;
            _recordings.Upsert(new RecordingAsset
            {
                Id = Guid.NewGuid(),
                MeetingId = meetingId,
                Kind = kind,
                Url = url!,
                ExpiresAt = exp,
                CreatedAt = now
            });
        }

        AddRecording("audio", d.Audio);
        AddRecording("video", d.Video);

        var secondaryArtifact = d.Diarization ?? d.RawTranscription;

        var t = _transcripts.GetByMeetingId(meetingId);
        if (t is null)
        {
            t = new Transcript
            {
                Id = Guid.NewGuid(),
                MeetingId = meetingId,
                Status = TranscriptStatus.Ready,
                RawText = null,
                ExternalTranscriptionUrl = d.Transcription,
                ExternalRawTranscriptionUrl = secondaryArtifact,
                UpdatedAt = now
            };
            _transcripts.Upsert(t);
        }
        else
        {
            t.Status = TranscriptStatus.Ready;
            t.ExternalTranscriptionUrl ??= d.Transcription;
            t.ExternalRawTranscriptionUrl ??= secondaryArtifact;
            t.UpdatedAt = now;
            _transcripts.Upsert(t);
        }

        var tAfter = _transcripts.GetByMeetingId(meetingId);
        var hasArtifactUrl = tAfter is not null
                             && (!string.IsNullOrEmpty(tAfter.ExternalTranscriptionUrl)
                                 || !string.IsNullOrEmpty(tAfter.ExternalRawTranscriptionUrl));
        return !hadArtifactUrl && hasArtifactUrl;
    }
}
