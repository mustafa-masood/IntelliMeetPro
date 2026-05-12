namespace IntelliMeet.Backend.Options;

/// <summary>
/// RAG retrieval settings (chunking + Pinecone query breadth). Bound with <see cref="MinChunkSizeChars"/> / <see cref="MaxChunkSizeChars"/> when resolving chunk parameters.
/// </summary>
public sealed class RagOptions
{
    public const string SectionName = "Rag";

    public bool EnableIndexing { get; set; } = true;
    public bool EnableChat { get; set; } = true;

    /// <summary>Target chunk length in characters before bounds are applied.</summary>
    public int ChunkSizeChars { get; set; } = 1800;

    /// <summary>Overlap between consecutive chunks (characters).</summary>
    public int ChunkOverlapChars { get; set; } = 300;

    /// <summary>Lower bound applied to <see cref="ChunkSizeChars"/> when splitting transcripts.</summary>
    public int MinChunkSizeChars { get; set; } = 100;

    /// <summary>Upper bound applied to <see cref="ChunkSizeChars"/> when splitting transcripts.</summary>
    public int MaxChunkSizeChars { get; set; } = 50000;

    /// <summary>Number of vectors to retrieve from Pinecone per question.</summary>
    public int TopK { get; set; } = 4;

    /// <summary>Clamped <see cref="TopK"/> used for Pinecone queries (minimum 1).</summary>
    public int EffectiveTopK => Math.Max(1, TopK);

    /// <summary>When using global AskAI (across all meetings), limit the number of meetings to scan.</summary>
    public int GlobalMeetingsTake { get; set; } = 25;

    /// <summary>For each meeting in global AskAI, retrieve up to this many chunks.</summary>
    public int GlobalTopKPerMeeting { get; set; } = 2;

    /// <summary>Total chunks allowed in the LLM context for global AskAI.</summary>
    public int GlobalMaxContextChunks { get; set; } = 12;

    /// <summary>
    /// Resolves effective chunk size, overlap, and step from configured values.
    /// </summary>
    public (int EffectiveChunkSizeChars, int EffectiveOverlapChars, int StepChars) ResolveChunkParameters()
    {
        var min = Math.Max(1, MinChunkSizeChars);
        var max = Math.Max(min, MaxChunkSizeChars);
        var size = Math.Clamp(ChunkSizeChars, min, max);
        var maxOverlap = Math.Max(0, size - 1);
        var overlap = Math.Clamp(ChunkOverlapChars, 0, maxOverlap);
        var step = Math.Max(1, size - overlap);
        return (size, overlap, step);
    }
}
