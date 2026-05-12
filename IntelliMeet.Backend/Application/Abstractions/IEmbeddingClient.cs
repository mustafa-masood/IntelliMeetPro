namespace IntelliMeet.Backend.Application.Abstractions;

public interface IEmbeddingClient
{
    Task<float[]> GetEmbeddingAsync(string text, CancellationToken ct);
    Task<IReadOnlyList<float[]>> GetEmbeddingsAsync(IReadOnlyList<string> texts, CancellationToken ct);
}
