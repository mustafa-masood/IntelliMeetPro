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
            if (!string.IsNullOrWhiteSpace(t.RawText))
                return Normalize(t.RawText);

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
            // Prefer diarization (speaker-attributed), then processed transcription, then raw.
            var fromMb = await TryFetchUrlAsync(details.Data.Diarization, ct).ConfigureAwait(false);
            if (!string.IsNullOrWhiteSpace(fromMb))
                return fromMb;
            fromMb = await TryFetchUrlAsync(details.Data.Transcription, ct).ConfigureAwait(false);
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
        if (t.StartsWith('[') || t.StartsWith('{'))
        {
            try
            {
                using var doc = JsonDocument.Parse(t);
                if (doc.RootElement.ValueKind == JsonValueKind.Array)
                {
                    var sb = new StringBuilder();
                    foreach (var el in doc.RootElement.EnumerateArray())
                    {
                        var sp = el.TryGetProperty("speaker", out var s) ? s.GetString() : null;
                        if (el.TryGetProperty("text", out var tx))
                        {
                            if (!string.IsNullOrEmpty(sp))
                                sb.Append('[').Append(sp).Append("] ");
                            sb.AppendLine(tx.GetString());
                        }
                        else if (el.TryGetProperty("content", out var c))
                            sb.AppendLine(c.GetString());
                    }

                    var s2 = sb.ToString().Trim();
                    return s2.Length > 0 ? s2 : null;
                }
            }
            catch
            {
                /* fall through */
            }
        }

        return Normalize(t);
    }

    private static string Normalize(string s) => s.Trim();
}
