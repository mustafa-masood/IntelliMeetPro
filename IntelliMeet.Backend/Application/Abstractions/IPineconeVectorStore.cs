using IntelliMeet.Backend.Application.Models;

namespace IntelliMeet.Backend.Application.Abstractions;

public interface IPineconeVectorStore
{
    /// <summary>False for the no-op implementation when Pinecone data-plane URL cannot be built from configuration.</summary>
    bool IsRemoteIndexConfigured { get; }

    Task UpsertMeetingChunksAsync(string tenantKey, Guid meetingId, IReadOnlyList<MeetingChunkEmbedding> chunks, CancellationToken ct);
    Task<IReadOnlyList<RetrievedChunk>> QueryMeetingAsync(string tenantKey, Guid meetingId, float[] queryEmbedding, int topK, CancellationToken ct);

    /// <summary>
    /// Returns the vector count for this meeting's Pinecone namespace from index stats, or 0 if unknown/unavailable.
    /// </summary>
    Task<int> GetIndexedVectorCountAsync(string tenantKey, Guid meetingId, CancellationToken ct);
}
