using System.ComponentModel.DataAnnotations;
using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.DTOs;

public sealed class MeetingListItemDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string MeetingUrl { get; init; } = string.Empty;
    public MeetingStatus Status { get; init; }
    public DateTimeOffset? StartUtc { get; init; }
    public DateTimeOffset? EndUtc { get; init; }
    public string? PrimaryBotStatus { get; init; }
    public string? PrimaryBotStatusLabel { get; init; }
    public string? ProcessingStatusLabel { get; init; }
}

public sealed class MeetingDetailDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Platform { get; init; }
    public string MeetingUrl { get; init; } = string.Empty;
    public MeetingStatus Status { get; init; }
    public DateTimeOffset? StartUtc { get; init; }
    public DateTimeOffset? EndUtc { get; init; }
    public IReadOnlyList<string> Participants { get; init; } = Array.Empty<string>();
    public Guid? CalendarEventId { get; init; }
    public IReadOnlyList<MeetingBotSummaryDto> Bots { get; init; } = Array.Empty<MeetingBotSummaryDto>();
    public string? AudioPlaybackUrl { get; init; }
    public IReadOnlyList<WebhookHistoryItemDto> RecentWebhooks { get; init; } = Array.Empty<WebhookHistoryItemDto>();

    public MeetingProcessingStatus ProcessingStatus { get; init; }
    public string? LifecycleStatusLabel { get; init; }
    public string? ProcessingStatusLabel { get; init; }
    public bool TranscriptAnalysisCompleted { get; init; }
    public string? AnalysisError { get; init; }
    public DateTimeOffset? RagIndexedAtUtc { get; init; }

    /// <summary>Optional aggregate payload so the UI can render details from a single GET.</summary>
    public TranscriptDto? Transcript { get; init; }
    public MeetingSummaryDto? Summary { get; init; }
    public IReadOnlyList<ActionItemDto> ActionItems { get; init; } = Array.Empty<ActionItemDto>();
}

public sealed class MeetingBotSummaryDto
{
    public Guid Id { get; init; }
    public string ExternalBotId { get; init; } = string.Empty;
    public BotOperationalStatus Status { get; init; }
    public TranscriptStatus TranscriptionStatus { get; init; }
    public string? StatusLabel { get; init; }
    public string? TranscriptionStatusLabel { get; init; }
}

public sealed class WebhookHistoryItemDto
{
    public Guid Id { get; init; }
    public WebhookEventType EventType { get; init; }
    public DateTimeOffset ReceivedAt { get; init; }
    public bool Processed { get; init; }
}

public sealed class TranscriptDto
{
    public Guid MeetingId { get; init; }
    public TranscriptStatus Status { get; init; }
    public string? RawText { get; init; }
    public string? ExternalTranscriptionUrl { get; init; }
    /// <summary>Diarization or raw transcription presigned URL from Meeting BaaS.</summary>
    public string? ExternalRawTranscriptionUrl { get; init; }
    public IReadOnlyList<TranscriptSegmentDto> Segments { get; init; } = Array.Empty<TranscriptSegmentDto>();
}

public sealed class TranscriptSegmentDto
{
    public string Speaker { get; init; } = string.Empty;
    public double StartSeconds { get; init; }
    public double EndSeconds { get; init; }
    public string Text { get; init; } = string.Empty;
}

public sealed class MeetingSummaryDto
{
    public Guid MeetingId { get; init; }
    public string ShortSummary { get; init; } = string.Empty;
    public IReadOnlyList<string> StructuredSections { get; init; } = Array.Empty<string>();
    public IReadOnlyList<string> KeyPoints { get; init; } = Array.Empty<string>();
    public IReadOnlyList<string> Decisions { get; init; } = Array.Empty<string>();
    public IReadOnlyList<string> Risks { get; init; } = Array.Empty<string>();
}

public sealed class ActionItemDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Owner { get; init; }
    public DateTimeOffset? DueDate { get; init; }
    public ActionItemPriority Priority { get; init; }
    public string Status { get; init; } = string.Empty;
    public bool AddToTodoChecked { get; init; }
    public Guid? LinkedTodoItemId { get; init; }
    public string? ExternalTaskUrl { get; init; }
    public ProjectManagementPlatform? SyncedPlatform { get; init; }
    public Guid? AssignedUserId { get; init; }
    public string? SuggestedAssigneeName { get; init; }
    public float? SuggestedAssigneeConfidence { get; init; }
}

public sealed class AssignActionItemUserRequestDto
{
    public Guid? AssignedUserId { get; set; }
}

public sealed class AssignTaskRequestDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }
    public string? Assignee { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public ActionItemPriority Priority { get; set; } = ActionItemPriority.Medium;
}

public sealed class ConvertActionItemToTodoRequestDto
{
    public Guid? UserId { get; set; }
    public string? TodoType { get; set; }
}

public sealed class AnalyzeMeetingRequestDto
{
    /// <summary>When true, re-run Ollama even if a prior analysis completed.</summary>
    public bool Force { get; set; }
}
