using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.Models;

namespace IntelliMeet.Backend.Infrastructure.Rag;

/// <summary>
/// Used when Pinecone data-plane URL cannot be built from configuration so core API (e.g. meetings list) still resolves.
/// RAG upsert/query become no-ops until Pinecone:IndexName / host are set.
/// </summary>
public sealed class NoOpPineconeVectorStore : IPineconeVectorStore
{
    public bool IsRemoteIndexConfigured => false;

    public Task UpsertMeetingChunksAsync(string tenantKey, Guid meetingId, IReadOnlyList<MeetingChunkEmbedding> chunks, CancellationToken ct) =>
        Task.CompletedTask;

    public Task<IReadOnlyList<RetrievedChunk>> QueryMeetingAsync(string tenantKey, Guid meetingId, float[] queryEmbedding, int topK, CancellationToken ct) =>
        Task.FromResult<IReadOnlyList<RetrievedChunk>>(Array.Empty<RetrievedChunk>());

    public Task<int> GetIndexedVectorCountAsync(string tenantKey, Guid meetingId, CancellationToken ct) =>
        Task.FromResult(0);
}
