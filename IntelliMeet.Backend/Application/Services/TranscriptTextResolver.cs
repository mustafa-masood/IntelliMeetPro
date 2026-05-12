using System.Text;
using System.Text.Json;
using IntelliMeet.Backend.Application.Abstractions;

namespace IntelliMeet.Backend.Application.Services;

public sealed class TranscriptTextResolver : ITranscriptTextResolver
{
    private readonly ITranscriptRepository _transcripts;
    private readonly IMeetingBotRepository _bots;
    private readonly IMeetingBaasClient _mb;
    private readonly HttpClient _http;
    private readonly ILogger<TranscriptTextResolver> _logger;

    public TranscriptTextResolver(
        ITranscriptRepository transcripts,
        IMeetingBotRepository bots,
        IMeetingBaasClient mb,
        IHttpClientFactory httpClientFactory,
        ILogger<TranscriptTextResolver> logger)
    {
        _transcripts = transcripts;
        _bots = bots;
        _mb = mb;
        _http = httpClientFactory.CreateClient(nameof(TranscriptTextResolver));
        _logger = logger;
        _http.Timeout = TimeSpan.FromMinutes(2);
    }

    public async Task<string?> ResolvePlainTextAsync(Guid meetingId, CancellationToken ct)
    {
        var t = _transcripts.GetByMeetingId(meetingId);
        if (t is not null)
        {
            var fromStored = NormalizeFetched(t.RawText ?? string.Empty);
            if (!string.IsNullOrWhiteSpace(fromStored))
                return fromStored;

            var segments = _transcripts.GetSegments(t.Id);
            if (segments.Count > 0)
            {
                var sb = new StringBuilder();
                foreach (var s in segments.OrderBy(x => x.StartSeconds))
                {
                    if (!string.IsNullOrWhiteSpace(s.Speaker))
                        sb.Append('[').Append(s.Speaker).Append("] ");
                    sb.AppendLine(s.Text);
                }

                var joined = sb.ToString().Trim();
                if (joined.Length > 0)
                    return joined;
            }

            var fromUrl = await TryFetchUrlAsync(t.ExternalTranscriptionUrl, ct).ConfigureAwait(false);
            if (!string.IsNullOrWhiteSpace(fromUrl))
                return fromUrl;

            fromUrl = await TryFetchUrlAsync(t.ExternalRawTranscriptionUrl, ct).ConfigureAwait(false);
            if (!string.IsNullOrWhiteSpace(fromUrl))
                return fromUrl;
        }

        foreach (var bot in _bots.GetByMeetingId(meetingId))
        {
            if (string.IsNullOrWhiteSpace(bot.ExternalBotId))
                continue;
            var details = await _mb.GetBotAsync(bot.ExternalBotId, ct).ConfigureAwait(false);
            if (!details.Success || details.Data is null)
                continue;
            // Prefer processed transcription first (usually contains utterance text), then diarization/raw fallbacks.
            var fromMb = await TryFetchUrlAsync(details.Data.Transcription, ct).ConfigureAwait(false);
            if (!string.IsNullOrWhiteSpace(fromMb))
                return fromMb;
            fromMb = await TryFetchUrlAsync(details.Data.Diarization, ct).ConfigureAwait(false);
            if (!string.IsNullOrWhiteSpace(fromMb))
                return fromMb;
            fromMb = await TryFetchUrlAsync(details.Data.RawTranscription, ct).ConfigureAwait(false);
            if (!string.IsNullOrWhiteSpace(fromMb))
                return fromMb;
        }

        return null;
    }

    private async Task<string?> TryFetchUrlAsync(string? url, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(url) || !Uri.TryCreate(url, UriKind.Absolute, out var uri))
            return null;
        if (uri.Scheme is not ("http" or "https"))
            return null;

        try
        {
            using var resp = await _http.GetAsync(uri, ct).ConfigureAwait(false);
            if (!resp.IsSuccessStatusCode)
                return null;
            var body = await resp.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
            return NormalizeFetched(body);
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Transcript URL fetch failed for {Url}", url);
            return null;
        }
    }

    private static string? NormalizeFetched(string body)
    {
        var t = body.Trim();
        if (t.Length == 0)
            return null;
        var lookedLikeJson = false;
        if (t.StartsWith('[') || t.StartsWith('{'))
        {
            lookedLikeJson = true;
            try
            {
                using var doc = JsonDocument.Parse(t);
                if (TryExtractFromJsonRoot(doc.RootElement, out var extracted))
                    return extracted;
            }
            catch
            {
                /* fall through */
            }
        }

        var fromJsonLines = TryExtractFromJsonLines(t);
        if (!string.IsNullOrWhiteSpace(fromJsonLines))
            return fromJsonLines;

        // If this looked structured but carried no textual content, avoid returning metadata blobs.
        if (lookedLikeJson || LooksLikeJsonLines(t))
            return null;

        return Normalize(t);
    }

    private static bool TryExtractFromJsonRoot(JsonElement root, out string? extracted)
    {
        extracted = null;
        if (root.ValueKind == JsonValueKind.Array)
        {
            extracted = BuildFromArray(root);
            return !string.IsNullOrWhiteSpace(extracted);
        }

        if (root.ValueKind != JsonValueKind.Object)
            return false;

        if (root.TryGetProperty("result", out var resultObj) &&
            resultObj.ValueKind == JsonValueKind.Object &&
            resultObj.TryGetProperty("utterances", out var utterances) &&
            utterances.ValueKind == JsonValueKind.Array)
        {
            extracted = BuildFromArray(utterances);
            return !string.IsNullOrWhiteSpace(extracted);
        }

        if (root.TryGetProperty("utterances", out var directUtterances) && directUtterances.ValueKind == JsonValueKind.Array)
        {
            extracted = BuildFromArray(directUtterances);
            return !string.IsNullOrWhiteSpace(extracted);
        }

        if (root.TryGetProperty("text", out var textProp) && textProp.ValueKind == JsonValueKind.String)
        {
            extracted = Normalize(textProp.GetString() ?? string.Empty);
            return !string.IsNullOrWhiteSpace(extracted);
        }

        return false;
    }

    private static string? BuildFromArray(JsonElement array)
    {
        var sb = new StringBuilder();
        foreach (var el in array.EnumerateArray())
        {
            var sp = el.TryGetProperty("speaker", out var s) ? s.GetString() : null;
            if (el.TryGetProperty("text", out var tx) && tx.ValueKind == JsonValueKind.String)
            {
                var line = tx.GetString();
                if (!string.IsNullOrWhiteSpace(line))
                {
                    if (!string.IsNullOrEmpty(sp))
                        sb.Append('[').Append(sp).Append("] ");
                    sb.AppendLine(line);
                }
            }
            else if (el.TryGetProperty("content", out var c) && c.ValueKind == JsonValueKind.String)
            {
                var line = c.GetString();
                if (!string.IsNullOrWhiteSpace(line))
                    sb.AppendLine(line);
            }
        }
        var joined = sb.ToString().Trim();
        return joined.Length > 0 ? joined : null;
    }

    private static string? TryExtractFromJsonLines(string text)
    {
        var lines = text.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (lines.Length == 0)
            return null;

        var sb = new StringBuilder();
        var parsedAny = false;
        foreach (var line in lines)
        {
            if (!line.StartsWith('{') || !line.EndsWith('}'))
                continue;
            try
            {
                using var doc = JsonDocument.Parse(line);
                if (!TryExtractFromJsonRoot(doc.RootElement, out var extracted) || string.IsNullOrWhiteSpace(extracted))
                    continue;
                sb.AppendLine(extracted);
                parsedAny = true;
            }
            catch
            {
                // Not a strict JSONL transcript line; skip.
            }
        }

        if (!parsedAny)
            return null;
        var joined = sb.ToString().Trim();
        return joined.Length > 0 ? joined : null;
    }

    private static bool LooksLikeJsonLines(string text)
    {
        var lines = text.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        return lines.Length > 0 && lines.All(line => line.StartsWith('{') && line.EndsWith('}'));
    }

    private static string Normalize(string s) => s.Trim();
}
