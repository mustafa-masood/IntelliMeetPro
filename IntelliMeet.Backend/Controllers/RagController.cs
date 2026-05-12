using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Application.Exceptions;
using IntelliMeet.Backend.Application.Services;
using IntelliMeet.Backend.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("api/rag")]
public sealed class RagController : ControllerBase
{
    private readonly IMeetingRagService _rag;
    private readonly IMeetingRepository _meetings;
    private readonly IPineconeVectorStore _vectors;
    private readonly IOptions<RagOptions> _ragOptions;
    private readonly ICurrentUserContext _currentUser;
    private readonly IUserRepository _users;

    public RagController(
        IMeetingRagService rag,
        IMeetingRepository meetings,
        IPineconeVectorStore vectors,
        IOptions<RagOptions> ragOptions,
        ICurrentUserContext currentUser,
        IUserRepository users)
    {
        _rag = rag;
        _meetings = meetings;
        _vectors = vectors;
        _ragOptions = ragOptions;
        _currentUser = currentUser;
        _users = users;
    }

    /// <summary>Returns configured RAG settings and indexed vector count for this meeting's Pinecone namespace.</summary>
    [HttpGet("meetings/{id:guid}/stats")]
    public async Task<ActionResult<RagMeetingStatsDto>> MeetingStats(Guid id, CancellationToken ct)
    {
        var meeting = _meetings.GetById(id);
        if (meeting is null)
            return NotFound();

        // Enforce workspace/team visibility (same semantics as meeting + RAG services).
        if (_currentUser.IsResolved && _currentUser.WorkspaceId != Guid.Empty && meeting.WorkspaceId.HasValue)
        {
            if (meeting.WorkspaceId.Value != _currentUser.WorkspaceId)
                return NotFound();
            if (_currentUser.Role == Domain.Enums.WorkspaceMemberRole.Member && _currentUser.TeamId.HasValue)
            {
                if (!meeting.TeamId.HasValue || meeting.TeamId.Value != _currentUser.TeamId.Value)
                    return NotFound();
            }
        }

        var rag = _ragOptions.Value;
        var (effSize, effOverlap, step) = rag.ResolveChunkParameters();
        var tenantKey = ResolveTenantKey(meeting);
        var indexed = await _vectors.GetIndexedVectorCountAsync(tenantKey, id, ct).ConfigureAwait(false);

        return Ok(new RagMeetingStatsDto
        {
            MeetingId = id,
            RagIndexedAtUtc = meeting.RagIndexedAtUtc,
            IndexedChunkCount = indexed,
            TopK = rag.TopK,
            EffectiveTopK = rag.EffectiveTopK,
            ChunkSizeChars = rag.ChunkSizeChars,
            ChunkOverlapChars = rag.ChunkOverlapChars,
            MinChunkSizeChars = rag.MinChunkSizeChars,
            MaxChunkSizeChars = rag.MaxChunkSizeChars,
            EffectiveChunkSizeChars = effSize,
            EffectiveOverlapChars = effOverlap,
            StepChars = step,
            EnableIndexing = rag.EnableIndexing,
            EnableChat = rag.EnableChat
        });
    }

    private string ResolveTenantKey(Domain.Entities.Meeting meeting)
    {
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

    [HttpPost("meetings/{id:guid}/chat")]
    public async Task<ActionResult<RagChatResponseDto>> Chat(Guid id, [FromBody] RagChatRequestDto body, CancellationToken ct)
    {
        try
        {
            var res = await _rag.AskMeetingAsync(id, body.Question, ct).ConfigureAwait(false);
            var meeting = _meetings.GetById(id);
            return Ok(new RagChatResponseDto
            {
                Answer = res.Answer,
                ContextChunks = res.ContextChunks.Select(c => new RagContextChunkDto
                {
                    ChunkId = c.ChunkId,
                    Text = c.Text,
                    Score = c.Score,
                    MeetingId = c.MeetingId,
                    MeetingTitle = meeting?.Title
                }).ToList()
            });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (PlanLimitExceededException ex)
        {
            return StatusCode(402, new { code = ex.Code, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }

    /// <summary>Global AskAI: answers from indexed transcript chunks across multiple meetings.</summary>
    [HttpPost("chat")]
    public async Task<ActionResult<RagChatResponseDto>> GlobalChat([FromBody] RagChatRequestDto body, CancellationToken ct)
    {
        try
        {
            var res = await _rag.AskAllMeetingsAsync(body.Question, ct).ConfigureAwait(false);
            var meetingTitles = _meetings.GetAll().ToDictionary(m => m.Id, m => m.Title);
            return Ok(new RagChatResponseDto
            {
                Answer = res.Answer,
                ContextChunks = res.ContextChunks.Select(c => new RagContextChunkDto
                {
                    ChunkId = c.ChunkId,
                    Text = c.Text,
                    Score = c.Score,
                    MeetingId = c.MeetingId,
                    MeetingTitle = meetingTitles.TryGetValue(c.MeetingId, out var t) ? t : null
                }).ToList()
            });
        }
        catch (PlanLimitExceededException ex)
        {
            return StatusCode(402, new { code = ex.Code, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }
}
