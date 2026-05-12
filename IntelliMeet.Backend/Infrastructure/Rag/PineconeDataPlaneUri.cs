using IntelliMeet.Backend.Options;

namespace IntelliMeet.Backend.Infrastructure.Rag;

internal static class PineconeDataPlaneUri
{
    /// <summary>
    /// Builds a valid Pinecone data-plane base URI, or returns false when <see cref="PineconeOptions"/> cannot produce one
    /// (e.g. empty index name with default host pattern).
    /// </summary>
    public static bool TryCreateBaseUri(PineconeOptions o, out Uri? uri)
    {
        uri = null;
        var host = o.Environment;
        if (string.IsNullOrWhiteSpace(host))
        {
            if (string.IsNullOrWhiteSpace(o.IndexName))
                return false;
            host = $"{o.IndexName}.svc.pinecone.io";
        }
        else if (!host.Contains("pinecone.io", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(o.IndexName))
                return false;
            host = $"{o.IndexName}-{host}.svc.pinecone.io";
        }

        if (!host.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            host = $"https://{host}";

        var trimmed = host.TrimEnd('/');
        if (!Uri.TryCreate(trimmed, UriKind.Absolute, out var u))
            return false;
        if (string.IsNullOrEmpty(u.Host) || u.Host.StartsWith('.'))
            return false;
        uri = u;
        return true;
    }
}
