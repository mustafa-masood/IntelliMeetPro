using System.Text;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.Exceptions;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Application.Models;
using IntelliMeet.Backend.Infrastructure.Ollama;
using IntelliMeet.Backend.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Application.Services;

public sealed class MeetingRagService : IMeetingRagService
{
    private readonly IMeetingRepository _meetings;
    private readonly IEmbeddingClient _embeddings;
    private readonly IPineconeVectorStore _vectors;
    private readonly IOllamaChatCompletionsClient _ollama;
    private readonly RagOptions _options;
    private readonly ICurrentUserContext _currentUser;
    private readonly IUserRepository _users;
    private readonly IUsageEntitlementService _usage;
    private readonly ILogger<MeetingRagService> _logger;

    public MeetingRagService(
        IMeetingRepository meetings,
        IEmbeddingClient embeddings,
        IPineconeVectorStore vectors,
        IOllamaChatCompletionsClient ollama,
        IOptions<RagOptions> options,
        ICurrentUserContext currentUser,
        IUserRepository users,
        IUsageEntitlementService usage,
        ILogger<MeetingRagService> logger)
    {
        _meetings = meetings;
        _embeddings = embeddings;
        _vectors = vectors;
        _ollama = ollama;
        _options = options.Value;
        _currentUser = currentUser;
        _users = users;
        _usage = usage;
        _logger = logger;
    }

    public async Task<MeetingRagChatResult> AskMeetingAsync(Guid meetingId, string question, CancellationToken ct)
    {
        if (!_options.EnableChat)
            throw new InvalidOperationException("RAG chat is disabled by configuration.");

        var meeting = _meetings.GetById(meetingId);
        if (meeting is null || !CanAccessMeeting(meeting))
            throw new KeyNotFoundException("Meeting not found.");
        if (string.IsNullOrWhiteSpace(question))
            throw new InvalidOperationException("Question is required.");
        EnsureChatEntitlement();

        var q = await _embeddings.GetEmbeddingAsync(question.Trim(), ct).ConfigureAwait(false);
        var topK = _options.EffectiveTopK;
        _logger.LogInformation("RAG chat query meeting {MeetingId} topK={TopK} (configured TopK={ConfiguredTopK})", meetingId, topK, _options.TopK);
        var tenantKey = ResolveTenantKey(meeting);
        var ctx = (await _vectors.QueryMeetingAsync(tenantKey, meetingId, q, topK, ct).ConfigureAwait(false))
            .Where(c => !LooksLikeMetadataOnly(c.Text))
            .ToList();
        if (ctx.Count == 0)
            return new MeetingRagChatResult("I could not find indexed transcript context for this meeting yet.", ctx);

        var system =
            "You are an assistant answering questions strictly based on the provided meeting transcript segments. " +
            "Do not invent facts. Do not assume tasks/owners/dates unless explicitly present in the segments. " +
            "If you cannot answer, say so. When you make a factual claim, cite the segment id(s) you used.";
        var user = BuildUserPrompt(question, ctx);
        var answer = await _ollama.CompleteAsync(system, user, ct).ConfigureAwait(false);
        RecordChatEntitlement();
        return new MeetingRagChatResult(answer.Trim(), ctx);
    }

    public async Task<MeetingRagChatResult> AskAllMeetingsAsync(string question, CancellationToken ct)
    {
        if (!_options.EnableChat)
            throw new InvalidOperationException("RAG chat is disabled by configuration.");
        if (string.IsNullOrWhiteSpace(question))
            throw new InvalidOperationException("Question is required.");
        EnsureChatEntitlement();

        var q = await _embeddings.GetEmbeddingAsync(question.Trim(), ct).ConfigureAwait(false);

        var takeMeetings = Math.Clamp(_options.GlobalMeetingsTake, 1, 200);
        var perMeeting = Math.Clamp(_options.GlobalTopKPerMeeting, 1, 5);
        var maxChunks = Math.Clamp(_options.GlobalMaxContextChunks, 1, 25);

        // Only scan meetings that were indexed at least once.
        var source = _currentUser.IsResolved && _currentUser.WorkspaceId != Guid.Empty
            ? _meetings.ListForWorkspace(_currentUser.WorkspaceId)
            : _meetings.GetAll();

        if (_currentUser.IsResolved &&
            _currentUser.WorkspaceId != Guid.Empty &&
            _currentUser.Role == Domain.Enums.WorkspaceMemberRole.Member &&
            _currentUser.TeamId.HasValue)
        {
            source = source.Where(m => m.TeamId.HasValue && m.TeamId.Value == _currentUser.TeamId.Value).ToList();
        }
        var candidates = source
            .Where(m => m.RagIndexedAtUtc.HasValue)
            .OrderByDescending(m => m.StartUtc ?? m.CreatedAt)
            .Take(takeMeetings)
            .ToList();

        var chunks = new List<RetrievedChunk>();
        foreach (var m in candidates)
        {
            var tenantKey = ResolveTenantKey(m);
            var ctx = await _vectors.QueryMeetingAsync(tenantKey, m.Id, q, perMeeting, ct).ConfigureAwait(false);
            if (ctx.Count > 0)
                chunks.AddRange(ctx);
        }

        var best = chunks
            .Where(c => !LooksLikeMetadataOnly(c.Text))
            .OrderByDescending(c => c.Score)
            .Take(maxChunks)
            .ToList();

        if (best.Count == 0)
            return new MeetingRagChatResult("I could not find indexed transcript context across your meetings yet.", best);

        var system =
            "You are an assistant answering questions strictly based on the provided transcript segments from multiple meetings. " +
            "Do not invent facts. Do not assume tasks/owners/dates unless explicitly present in the segments. " +
            "If the answer is not present, say so. When you make a factual claim, cite the segment id(s) you used.";
        var user = BuildUserPrompt(question, best);
        var answer = await _ollama.CompleteAsync(system, user, ct).ConfigureAwait(false);
        RecordChatEntitlement();
        return new MeetingRagChatResult(answer.Trim(), best);
    }

    private void EnsureChatEntitlement()
    {
        if (!_currentUser.IsResolved) return;
        var u = _users.GetTrackedById(_currentUser.UserId);
        if (u is null) return;
        var c = _usage.CanRunChat(u);
        if (!c.ok)
            throw new PlanLimitExceededException(c.code ?? "PLAN_LIMIT_EXCEEDED", c.message ?? "Plan limit exceeded.");
    }

    private void RecordChatEntitlement()
    {
        if (!_currentUser.IsResolved) return;
        var u = _users.GetTrackedById(_currentUser.UserId);
        if (u is null) return;
        _usage.RecordChat(u);
        _users.Upsert(u);
    }

    private bool CanAccessMeeting(Meeting? m)
    {
        if (m is null) return false;
        if (!_currentUser.IsResolved || _currentUser.WorkspaceId == Guid.Empty) return true;
        if (!m.WorkspaceId.HasValue) return true;
        if (m.WorkspaceId.Value != _currentUser.WorkspaceId) return false;
        if (_currentUser.Role == Domain.Enums.WorkspaceMemberRole.Member && _currentUser.TeamId.HasValue)
            return m.TeamId.HasValue && m.TeamId.Value == _currentUser.TeamId.Value;
        return true;
    }

    private string ResolveTenantKey(Meeting meeting)
    {
        // Enterprise isolation is derived from the meeting itself (workspace/team); Basic/Pro uses user identity.
        var organizer = meeting.OrganizerUserId.HasValue ? _users.GetById(meeting.OrganizerUserId.Value) : null;
        var isEnterprise = organizer is not null &&
                           organizer.CurrentPlan == Domain.Enums.BillingSubscriptionTier.Enterprise &&
                           organizer.SubscriptionStatus == Domain.Enums.BillingSubscriptionStatus.Active;
        if (isEnterprise && meeting.WorkspaceId.HasValue && meeting.TeamId.HasValue)
            return $"ws-{meeting.WorkspaceId.Value:N}-team-{meeting.TeamId.Value:N}";
        if (isEnterprise && meeting.WorkspaceId.HasValue)
            return $"ws-{meeting.WorkspaceId.Value:N}";
        var userId = meeting.OrganizerUserId ?? organizer?.Id ?? Guid.Empty;
        return $"user-{userId:N}";
    }

    private static string BuildUserPrompt(string question, IReadOnlyList<RetrievedChunk> chunks)
    {
        var sb = new StringBuilder();
        sb.AppendLine("QUESTION:");
        sb.AppendLine(question.Trim());
        sb.AppendLine();
        sb.AppendLine("TRANSCRIPT_SEGMENTS:");
        foreach (var c in chunks)
        {
            sb.AppendLine($"[meeting:{c.MeetingId} chunk:{c.ChunkId}] (score: {c.Score:F3})");
            sb.AppendLine(c.Text);
            sb.AppendLine();
        }
        sb.AppendLine("Answer using only the segments above. If insufficient context, say so.");
        sb.AppendLine("CITE segments like: [meeting:<guid> chunk:<id>].");
        return sb.ToString();
    }

    private static bool LooksLikeMetadataOnly(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return true;
        var t = text.TrimStart();
        // Old diarization JSON blobs and JSONL lines (speaker/start/end) should never be used as meeting content.
        if (t.StartsWith('{') && t.Contains("\"speaker\"", StringComparison.OrdinalIgnoreCase) && !t.Contains("\"text\"", StringComparison.OrdinalIgnoreCase))
            return true;
        // Highly structured braces-heavy payloads are usually artifacts, not dialogue.
        var braceCount = t.Count(ch => ch is '{' or '}');
        if (braceCount > 8 && !t.Contains(' ', StringComparison.Ordinal))
            return true;
        return false;
    }
}
