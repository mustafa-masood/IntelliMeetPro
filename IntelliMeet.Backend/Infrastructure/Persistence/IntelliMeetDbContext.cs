using System.Text.Json;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class IntelliMeetDbContext : DbContext
{
    public IntelliMeetDbContext(DbContextOptions<IntelliMeetDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Meeting> Meetings => Set<Meeting>();
    public DbSet<MeetingBot> MeetingBots => Set<MeetingBot>();
    public DbSet<BotJoinRequest> BotJoinRequests => Set<BotJoinRequest>();
    public DbSet<BotExecution> BotExecutions => Set<BotExecution>();
    public DbSet<RecordingAsset> RecordingAssets => Set<RecordingAsset>();
    public DbSet<Transcript> Transcripts => Set<Transcript>();
    public DbSet<TranscriptSegment> TranscriptSegments => Set<TranscriptSegment>();
    public DbSet<MeetingSummary> MeetingSummaries => Set<MeetingSummary>();
    public DbSet<KeyPoint> KeyPoints => Set<KeyPoint>();
    public DbSet<ActionItem> ActionItems => Set<ActionItem>();
    public DbSet<TodoItem> TodoItems => Set<TodoItem>();
    public DbSet<CalendarConnection> CalendarConnections => Set<CalendarConnection>();
    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();
    public DbSet<IntegrationCredentials> IntegrationCredentials => Set<IntegrationCredentials>();
    public DbSet<WebhookEvent> WebhookEvents => Set<WebhookEvent>();
    public DbSet<ProjectManagementIntegration> ProjectManagementIntegrations => Set<ProjectManagementIntegration>();
    public DbSet<Workspace> Workspaces => Set<Workspace>();
    public DbSet<WorkspaceMember> WorkspaceMembers => Set<WorkspaceMember>();
    public DbSet<Team> Teams => Set<Team>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var listStringConverter = new ValueConverter<IReadOnlyList<string>, string>(
            v => JsonSerializer.Serialize(v ?? Array.Empty<string>(), (JsonSerializerOptions?)null),
            v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>());

        var listStringComparer = new ValueComparer<IReadOnlyList<string>>(
            (a, b) => (a ?? Array.Empty<string>()).SequenceEqual(b ?? Array.Empty<string>()),
            c => (c ?? Array.Empty<string>()).Aggregate(0, (hash, item) => HashCode.Combine(hash, item.GetHashCode())),
            c => (IReadOnlyList<string>)(c ?? Array.Empty<string>()).ToList());

        modelBuilder.Entity<User>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Email).HasMaxLength(256);
            b.Property(x => x.DisplayName).HasMaxLength(256);
            b.Property(x => x.MeetingBaasCalendarId).HasMaxLength(128);
            b.Property(x => x.CalendarProvider).HasMaxLength(32);
            b.Property(x => x.ExternalUserId).HasMaxLength(256);
            b.Property(x => x.ExternalAuthProvider).HasMaxLength(64);
            b.Property(x => x.StripeCustomerId).HasMaxLength(128);
            b.Property(x => x.StripeSubscriptionId).HasMaxLength(128);
            b.Property(x => x.CurrentPlan).HasConversion<int>();
            b.Property(x => x.SubscriptionStatus).HasConversion<int>();
            b.HasIndex(x => x.ExternalUserId);
            b.HasIndex(x => x.Email);
            b.HasIndex(x => x.StripeCustomerId);
        });

        modelBuilder.Entity<Meeting>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Title).HasMaxLength(512);
            b.Property(x => x.Platform).HasMaxLength(64);
            b.Property(x => x.MeetingUrl).HasMaxLength(2048);
            b.Property(x => x.GoogleCalendarEventId).HasMaxLength(256);
            b.Property(x => x.GoogleCalendarHtmlLink).HasMaxLength(2048);
            b.Property(x => x.BotJobId).HasMaxLength(128);
            b.Property(x => x.Participants)
                .HasConversion(listStringConverter)
                .Metadata.SetValueComparer(listStringComparer);
            b.HasIndex(x => x.StartUtc);
            b.HasIndex(x => x.OrganizerUserId);
            b.HasIndex(x => x.CalendarEventId);
            b.HasIndex(x => x.WorkspaceId);
            b.HasIndex(x => x.TeamId);
            b.HasIndex(x => new { x.OrganizerUserId, x.GoogleCalendarEventId });
        });

        modelBuilder.Entity<MeetingBot>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.ExternalBotId).HasMaxLength(128);
            b.HasIndex(x => x.MeetingId);
            b.HasIndex(x => x.ExternalBotId);
        });

        modelBuilder.Entity<BotJoinRequest>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.MeetingUrl).HasMaxLength(2048);
            b.Property(x => x.BotName).HasMaxLength(256);
            b.Property(x => x.ResultingExternalBotId).HasMaxLength(128);
        });

        modelBuilder.Entity<BotExecution>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Phase).HasMaxLength(128);
            b.HasIndex(x => x.MeetingBotId);
            b.HasIndex(x => x.AtUtc);
        });

        modelBuilder.Entity<RecordingAsset>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Kind).HasMaxLength(32);
            b.Property(x => x.Url).HasMaxLength(4096);
            b.HasIndex(x => x.MeetingId);
        });

        modelBuilder.Entity<Transcript>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.ExternalTranscriptionUrl).HasMaxLength(4096);
            b.Property(x => x.ExternalRawTranscriptionUrl).HasMaxLength(4096);
            b.HasIndex(x => x.MeetingId).IsUnique();
        });

        modelBuilder.Entity<TranscriptSegment>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Speaker).HasMaxLength(256);
            b.HasIndex(x => x.TranscriptId);
        });

        modelBuilder.Entity<MeetingSummary>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.StructuredSections)
                .HasConversion(listStringConverter)
                .Metadata.SetValueComparer(listStringComparer);
            b.Property(x => x.Decisions)
                .HasConversion(listStringConverter)
                .Metadata.SetValueComparer(listStringComparer);
            b.Property(x => x.Risks)
                .HasConversion(listStringConverter)
                .Metadata.SetValueComparer(listStringComparer);
            b.HasIndex(x => x.MeetingId).IsUnique();
        });

        modelBuilder.Entity<KeyPoint>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Order).HasColumnName("OrderIndex");
            b.HasIndex(x => x.MeetingId);
        });

        modelBuilder.Entity<ActionItem>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Title).HasMaxLength(512);
            b.Property(x => x.Owner).HasMaxLength(256);
            b.Property(x => x.Status).HasMaxLength(32);
            b.Property(x => x.Source).HasMaxLength(64);
            b.Property(x => x.ExternalTaskUrl).HasMaxLength(2048);
            b.Property(x => x.SyncedPlatform).HasConversion<int?>();
            b.HasIndex(x => x.MeetingId);
            b.HasIndex(x => x.WorkspaceId);
            b.HasIndex(x => new { x.MeetingId, x.Source });
        });

        modelBuilder.Entity<TodoItem>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Title).HasMaxLength(512);
            b.Property(x => x.Type).HasMaxLength(64);
            b.HasIndex(x => x.UserId);
            b.HasIndex(x => x.SourceMeetingId);
        });

        modelBuilder.Entity<CalendarConnection>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.ExternalCalendarId).HasMaxLength(128);
            b.Property(x => x.RawCalendarId).HasMaxLength(256);
            b.Property(x => x.AccountEmail).HasMaxLength(256);
            b.Property(x => x.Status).HasMaxLength(64);
            b.HasIndex(x => x.ExternalCalendarId).IsUnique();
            b.HasIndex(x => x.UserId);
        });

        modelBuilder.Entity<CalendarEvent>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.ExternalEventId).HasMaxLength(256);
            b.Property(x => x.SeriesId).HasMaxLength(256);
            b.Property(x => x.Title).HasMaxLength(512);
            b.Property(x => x.MeetingUrl).HasMaxLength(2048);
            b.HasIndex(x => x.CalendarConnectionId);
            b.HasIndex(x => new { x.CalendarConnectionId, x.ExternalEventId }).IsUnique();
            b.HasIndex(x => x.StartUtc);
        });

        modelBuilder.Entity<IntegrationCredentials>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.OAuthClientId).HasMaxLength(512);
            b.Property(x => x.OAuthClientSecret).HasMaxLength(2048);
            b.Property(x => x.OAuthTenantId).HasMaxLength(512);
        });

        modelBuilder.Entity<WebhookEvent>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.ExternalMessageId).HasMaxLength(256);
            b.HasIndex(x => x.ExternalMessageId);
            b.HasIndex(x => x.ReceivedAt);
        });

        modelBuilder.Entity<ProjectManagementIntegration>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.AccessToken).HasMaxLength(8192);
            b.Property(x => x.RefreshToken).HasMaxLength(8192);
            b.Property(x => x.ProjectId).HasMaxLength(256);
            b.Property(x => x.BoardId).HasMaxLength(256);
            b.Property(x => x.JiraCloudId).HasMaxLength(128);
            b.Property(x => x.SelectedTargetName).HasMaxLength(512);
            b.Property(x => x.Platform).HasConversion<int>();
            b.HasIndex(x => x.WorkspaceId);
            b.HasIndex(x => new { x.UserId, x.Platform }).IsUnique();
        });

        modelBuilder.Entity<Workspace>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(256);
            b.Property(x => x.Plan).HasConversion<int>();
        });

        modelBuilder.Entity<WorkspaceMember>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Role).HasConversion<int>();
            b.HasIndex(x => new { x.WorkspaceId, x.UserId }).IsUnique();
            b.HasIndex(x => x.TeamId);
        });

        modelBuilder.Entity<Team>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(128);
            b.HasIndex(x => x.WorkspaceId);
            b.HasIndex(x => new { x.WorkspaceId, x.Name }).IsUnique();
        });
    }
}
