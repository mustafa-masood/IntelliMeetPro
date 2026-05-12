namespace IntelliMeet.Backend.Application.Models;

public sealed record MeetingChunk(
    Guid MeetingId,
    string ChunkId,
    string Text,
    int CharLength);

public sealed record MeetingChunkEmbedding(
    Guid MeetingId,
    string ChunkId,
    string Text,
    float[] Embedding);

public sealed record RetrievedChunk(
    Guid MeetingId,
    string ChunkId,
    string Text,
    double Score);

public sealed record MeetingRagChatResult(
    string Answer,
    IReadOnlyList<RetrievedChunk> ContextChunks);
