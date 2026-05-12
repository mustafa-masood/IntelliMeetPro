namespace IntelliMeet.Backend.Application.DTOs;

public sealed class RagChatRequestDto
{
    public string Question { get; set; } = string.Empty;
}

public sealed class RagContextChunkDto
{
    public string ChunkId { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public double Score { get; set; }
    public Guid? MeetingId { get; set; }
    public string? MeetingTitle { get; set; }
}

public sealed class RagChatResponseDto
{
    public string Answer { get; set; } = string.Empty;
    public IReadOnlyList<RagContextChunkDto> ContextChunks { get; set; } = Array.Empty<RagContextChunkDto>();
}

/// <summary>Diagnostics for RAG indexing and retrieval settings for one meeting.</summary>
public sealed class RagMeetingStatsDto
{
    public Guid MeetingId { get; set; }
    public DateTimeOffset? RagIndexedAtUtc { get; set; }

    /// <summary>Vectors stored in Pinecone for this meeting namespace (from describe_index_stats).</summary>
    public int IndexedChunkCount { get; set; }

    public int TopK { get; set; }
    public int EffectiveTopK { get; set; }

    public int ChunkSizeChars { get; set; }
    public int ChunkOverlapChars { get; set; }
    public int MinChunkSizeChars { get; set; }
    public int MaxChunkSizeChars { get; set; }

    public int EffectiveChunkSizeChars { get; set; }
    public int EffectiveOverlapChars { get; set; }
    public int StepChars { get; set; }

    public bool EnableIndexing { get; set; }
    public bool EnableChat { get; set; }
}
