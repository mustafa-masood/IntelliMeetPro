using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Domain.Entities;

public sealed class Meeting{
    public Guid Id { get; set; }

    /// <summary>Workspace scope for multi-tenant listings (nullable during migration).</summary>
    public Guid? WorkspaceId { get; set; }

    /// <summary>Enterprise-only: team scope within the workspace (nullable during migration/backfill).</summary>
    public Guid? TeamId { get; set; }

    public Guid? OrganizerUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Platform { get; set; }
    public string MeetingUrl { get; set; } = string.Empty;
    public DateTimeOffset? StartUtc { get; set; }
    public DateTimeOffset? EndUtc { get; set; }
    public IReadOnlyList<string> Participants { get; set; } = Array.Empty<string>();
    public MeetingStatus Status { get; set; }
    public Guid? CalendarEventId { get; set; }
    public string? GoogleCalendarEventId { get; set; }
    public string? GoogleCalendarHtmlLink { get; set; }
    public bool IsFromCalendar { get; set; }
    public bool IsCancelledFromCalendar { get; set; }
    public bool BotScheduleEnabled { get; set; } = true;
    public DateTimeOffset? BotScheduledAtUtc { get; set; }
    public string? BotJobId { get; set; }

    /// <summary>When true, automatic transcript analysis (Ollama) is skipped unless a manual analyze request uses <c>force</c>.</summary>
    public bool TranscriptAnalysisCompleted { get; set; }

    public MeetingProcessingStatus ProcessingStatus { get; set; }

    /// <summary>Last analysis or pipeline error (Ollama failure, missing transcript, etc.).</summary>
    public string? AnalysisError { get; set; }

    /// <summary>When transcript chunks were last upserted to the vector store for this meeting (if RAG indexing ran successfully).</summary>
    public DateTimeOffset? RagIndexedAtUtc { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
