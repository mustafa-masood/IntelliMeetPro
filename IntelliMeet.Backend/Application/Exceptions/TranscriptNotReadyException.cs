namespace IntelliMeet.Backend.Application.Exceptions;

/// <summary>Thrown when analysis is requested but transcript plain text cannot be resolved yet (after retries).</summary>
public sealed class TranscriptNotReadyException : InvalidOperationException
{
    public TranscriptNotReadyException(string message) : base(message)
    {
    }
}
