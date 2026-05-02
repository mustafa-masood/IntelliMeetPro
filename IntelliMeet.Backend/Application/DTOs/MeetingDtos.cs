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
}

public sealed class MeetingBotSummaryDto
{
    public Guid Id { get; init; }
    public string ExternalBotId { get; init; } = string.Empty;
    public BotOperationalStatus Status { get; init; }
    public TranscriptStatus TranscriptionStatus { get; init; }
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
}

public sealed class AssignTaskRequestDto
{
    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(200)]
    public string? Assignee { get; set; }

    public DateTimeOffset? DueDate { get; set; }
    public ActionItemPriority Priority { get; set; } = ActionItemPriority.Medium;
}

public sealed class ConvertActionItemToTodoRequestDto
{
    public Guid? UserId { get; set; }

    [MaxLength(100)]
    public string? TodoType { get; set; }
}
