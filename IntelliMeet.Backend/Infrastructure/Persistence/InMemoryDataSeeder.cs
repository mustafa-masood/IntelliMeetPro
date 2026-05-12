using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

/// <summary>Demo seed data. Replace with EF migrations + seed when persistence is added.</summary>
public static class InMemoryDataSeeder
{
    public static void Seed(
        IUserRepository users,
        IWorkspaceRepository workspaces,
        IMeetingRepository meetings,
        IMeetingBotRepository bots,
        ITranscriptRepository transcripts,
        IMeetingSummaryRepository summaries,
        IKeyPointRepository keyPoints,
        IActionItemRepository actionItems,
        ITodoRepository todos)
    {
        if (users.GetAll().Count > 0)
            return;

        var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var workspaceId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var now = DateTimeOffset.UtcNow;

        workspaces.UpsertWorkspace(new Workspace
        {
            Id = workspaceId,
            Name = "Demo workspace",
            Plan = WorkspacePlan.Basic,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        });

        users.Upsert(new User
        {
            Id = userId,
            Email = "demo@intellimeet.local",
            DisplayName = "Demo User",
            CreatedAt = DateTimeOffset.UtcNow.AddDays(-30),
            WorkspaceId = workspaceId,
            CurrentPlan = BillingSubscriptionTier.Basic,
            SubscriptionStatus = BillingSubscriptionStatus.Active
        });

        workspaces.UpsertMember(new WorkspaceMember
        {
            Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            WorkspaceId = workspaceId,
            UserId = userId,
            Role = WorkspaceMemberRole.Admin,
            CreatedAtUtc = now
        });

        var meetingId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        meetings.Upsert(new Meeting
        {
            Id = meetingId,
            WorkspaceId = workspaceId,
            OrganizerUserId = userId,
            Title = "Q2 Planning — seeded demo",
            Platform = "google_meet",
            MeetingUrl = "https://meet.google.com/demo-seed",
            StartUtc = now.AddDays(-1),
            EndUtc = now.AddDays(-1).AddHours(1),
            Participants = new[] { "Alice", "Bob" },
            Status = MeetingStatus.Completed,
            CalendarEventId = null,
            TranscriptAnalysisCompleted = true,
            ProcessingStatus = MeetingProcessingStatus.AnalysisComplete,
            AnalysisError = null,
            CreatedAt = now.AddDays(-2),
            UpdatedAt = now
        });

        bots.Upsert(new MeetingBot
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            MeetingId = meetingId,
            ExternalBotId = "00000000-0000-0000-0000-00000000seed",
            Status = BotOperationalStatus.Completed,
            TranscriptionStatus = TranscriptStatus.Ready,
            IsScheduled = false,
            CreatedAt = now,
            UpdatedAt = now
        });

        var tid = Guid.Parse("44444444-4444-4444-4444-444444444444");
        transcripts.Upsert(new Transcript
        {
            Id = tid,
            MeetingId = meetingId,
            Status = TranscriptStatus.Ready,
            RawText = "Alice: Welcome everyone.\nBob: Thanks for joining.",
            ExternalTranscriptionUrl = null,
            UpdatedAt = now
        });
        transcripts.ReplaceSegments(tid, new List<TranscriptSegment>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TranscriptId = tid,
                Speaker = "Alice",
                StartSeconds = 0,
                EndSeconds = 2.5,
                Text = "Welcome everyone."
            },
            new()
            {
                Id = Guid.NewGuid(),
                TranscriptId = tid,
                Speaker = "Bob",
                StartSeconds = 2.6,
                EndSeconds = 5,
                Text = "Thanks for joining."
            }
        });

        summaries.Upsert(new MeetingSummary
        {
            Id = Guid.NewGuid(),
            MeetingId = meetingId,
            ShortSummary = "Quick sync on Q2 priorities.",
            StructuredSections = new[] { "Goals: accelerate delivery", "Risks: staffing" },
            Decisions = Array.Empty<string>(),
            Risks = new[] { "Staffing constraints" },
            UpdatedAt = now
        });

        keyPoints.ReplaceForMeeting(meetingId, new List<KeyPoint>
        {
            new() { Id = Guid.NewGuid(), MeetingId = meetingId, Order = 0, Text = "Align on Q2 roadmap" },
            new() { Id = Guid.NewGuid(), MeetingId = meetingId, Order = 1, Text = "Review hiring plan" }
        });

        var actionId = Guid.Parse("55555555-5555-5555-5555-555555555555");
        actionItems.Upsert(new ActionItem
        {
            Id = actionId,
            MeetingId = meetingId,
            WorkspaceId = workspaceId,
            Title = "Send updated timeline",
            Description = "Share Gantt by Friday",
            Owner = "Alice",
            DueDate = now.AddDays(3),
            Priority = ActionItemPriority.High,
            Status = "open",
            AddToTodoChecked = false
        });

        todos.Upsert(new TodoItem
        {
            Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
            UserId = userId,
            Title = "Follow up on budget (from earlier check)",
            Description = "Seeded todo",
            Type = "action_item",
            DueDate = now.AddDays(5),
            Status = TodoStatus.Open,
            SourceMeetingId = meetingId,
            SourceActionItemId = null,
            CreatedAt = now,
            UpdatedAt = now
        });
    }
}
