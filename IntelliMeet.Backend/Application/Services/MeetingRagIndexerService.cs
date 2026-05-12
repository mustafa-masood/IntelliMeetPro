using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.Models;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Application.Services;

public sealed class MeetingRagIndexerService : IMeetingRagIndexerService
{
    private readonly IEmbeddingClient _embeddings;
    private readonly IPineconeVectorStore _vectors;
    private readonly IMeetingRepository _meetings;
    private readonly IUserRepository _users;
    private readonly RagOptions _options;
    private readonly ILogger<MeetingRagIndexerService> _logger;

    public MeetingRagIndexerService(
        IEmbeddingClient embeddings,
        IPineconeVectorStore vectors,
        IMeetingRepository meetings,
        IUserRepository users,
        IOptions<RagOptions> options,
        ILogger<MeetingRagIndexerService> logger)
    {
        _embeddings = embeddings;
        _vectors = vectors;
        _meetings = meetings;
        _users = users;
        _options = options.Value;
        _logger = logger;
    }

    public async Task IndexMeetingTranscriptAsync(Guid meetingId, string transcriptText, bool forceReindex, CancellationToken ct)
    {
        if (!_options.EnableIndexing)
        {
            _logger.LogDebug("RAG indexing disabled (Rag:EnableIndexing=false); skip meeting {MeetingId}", meetingId);
            return;
        }

        if (!_vectors.IsRemoteIndexConfigured)
        {
            _logger.LogInformation(
                "Vector store is not configured (Pinecone no-op). Skipping Voyage embeddings and upsert for meeting {MeetingId}.",
                meetingId);
            return;
        }

        if (string.IsNullOrWhiteSpace(transcriptText))
            return;

        var meeting = _meetings.GetById(meetingId);
        if (meeting is null)
            return;

        if (!forceReindex && meeting.RagIndexedAtUtc.HasValue)
        {
            _logger.LogDebug("Skip RAG reindex for meeting {MeetingId}: already indexed at {At}", meetingId, meeting.RagIndexedAtUtc);
            return;
        }

        var chunks = Chunk(meetingId, transcriptText);
        if (chunks.Count == 0)
            return;

        var vectors = await _embeddings.GetEmbeddingsAsync(chunks.Select(c => c.Text).ToList(), ct).ConfigureAwait(false);
        var rows = chunks.Select((chunk, i) =>
                new MeetingChunkEmbedding(chunk.MeetingId, chunk.ChunkId, chunk.Text, vectors[i]))
            .ToList();

        var tenantKey = ResolveTenantKey(meeting);
        await _vectors.UpsertMeetingChunksAsync(tenantKey, meetingId, rows, ct).ConfigureAwait(false);

        meeting = _meetings.GetById(meetingId);
        if (meeting is not null)
        {
            meeting.RagIndexedAtUtc = DateTimeOffset.UtcNow;
            _meetings.Upsert(meeting);
        }

        var (effSize, effOverlap, step) = _options.ResolveChunkParameters();
        _logger.LogInformation(
            "RAG indexed meeting {MeetingId}: {ChunkCount} chunks (effectiveChunkSize={EffectiveChunkSize}, overlap={EffectiveOverlap}, step={Step}; TopK={TopK})",
            meetingId,
            rows.Count,
            effSize,
            effOverlap,
            step,
            _options.EffectiveTopK);
    }

    private string ResolveTenantKey(Meeting meeting)
    {
        // Basic/Pro: isolate per user.
        // Enterprise: isolate per workspace+team (meeting carries TeamId).
        var organizer = meeting.OrganizerUserId.HasValue ? _users.GetById(meeting.OrganizerUserId.Value) : null;
        var isEnterprise = organizer is not null &&
                           organizer.CurrentPlan == Domain.Enums.BillingSubscriptionTier.Enterprise &&
                           organizer.SubscriptionStatus == Domain.Enums.BillingSubscriptionStatus.Active;
        if (isEnterprise && meeting.WorkspaceId.HasValue && meeting.TeamId.HasValue)
            return $"ws-{meeting.WorkspaceId.Value:N}-team-{meeting.TeamId.Value:N}";
        if (isEnterprise && meeting.WorkspaceId.HasValue)
            return $"ws-{meeting.WorkspaceId.Value:N}";
        var userId = meeting.OrganizerUserId ?? organizer?.Id ?? Guid.Empty;
        return $"user-{userId:N}";
    }

    private List<MeetingChunk> Chunk(Guid meetingId, string transcriptText)
    {
        var (size, _, step) = _options.ResolveChunkParameters();
        var chunks = new List<MeetingChunk>();

        var idx = 0;
        for (var start = 0; start < transcriptText.Length; start += step)
        {
            var len = Math.Min(size, transcriptText.Length - start);
            var text = transcriptText.Substring(start, len).Trim();
            if (string.IsNullOrWhiteSpace(text))
                continue;
            chunks.Add(new MeetingChunk(meetingId, $"chunk-{idx:D4}", text, text.Length));
            idx++;
        }

        return chunks;
    }
}
