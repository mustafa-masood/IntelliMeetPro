using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;
using IntelliMeet.Backend.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class EfRepositoryStore :
    IUserRepository,
    IWorkspaceRepository,
    IMeetingRepository,
    IMeetingBotRepository,
    IBotJoinRequestRepository,
    IBotExecutionRepository,
    IRecordingAssetRepository,
    ITranscriptRepository,
    IMeetingSummaryRepository,
    IKeyPointRepository,
    IActionItemRepository,
    ITodoRepository,
    ICalendarConnectionRepository,
    ICalendarEventRepository,
    IIntegrationCredentialsRepository,
    IWebhookEventRepository,
    IProjectManagementIntegrationRepository
{
    private readonly IntelliMeetDbContext _db;

    public EfRepositoryStore(IntelliMeetDbContext db) => _db = db;

    public IReadOnlyList<User> GetAll() => _db.Users.AsNoTracking().OrderBy(u => u.Email).ToList();
    public User? GetById(Guid id) => _db.Users.AsNoTracking().FirstOrDefault(u => u.Id == id);

    public User? GetByEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return null;
        var e = email.Trim();
        return _db.Users.AsNoTracking().FirstOrDefault(u => u.Email.ToLower() == e.ToLower());
    }

    public User? GetByExternalUserId(string externalUserId)
    {
        if (string.IsNullOrWhiteSpace(externalUserId)) return null;
        return _db.Users.AsNoTracking().FirstOrDefault(u => u.ExternalUserId == externalUserId);
    }

    public User? GetTrackedById(Guid id) => _db.Users.FirstOrDefault(u => u.Id == id);
    public IReadOnlyList<User> GetUsersWithGoogleCalendarConnected() =>
        _db.Users.AsNoTracking()
            .Where(u => u.CalendarConnected && !string.IsNullOrEmpty(u.GoogleAccessToken))
            .ToList();
    public void Upsert(User user)
    {
        UpsertById(_db.Users, user);
        _db.SaveChanges();
    }

    IReadOnlyList<Meeting> IMeetingRepository.GetAll() => _db.Meetings.AsNoTracking().OrderByDescending(m => m.StartUtc).ToList();

    IReadOnlyList<Meeting> IMeetingRepository.ListForWorkspace(Guid workspaceId) =>
        _db.Meetings.AsNoTracking()
            .Where(m => m.WorkspaceId == workspaceId)
            .OrderByDescending(m => m.StartUtc)
            .ToList();
    Meeting? IMeetingRepository.GetById(Guid id) => _db.Meetings.AsNoTracking().FirstOrDefault(m => m.Id == id);
    Meeting? IMeetingRepository.GetTrackedById(Guid id) => _db.Meetings.FirstOrDefault(m => m.Id == id);
    Meeting? IMeetingRepository.GetByGoogleCalendarEvent(Guid organizerUserId, string googleEventId) =>
        _db.Meetings.AsNoTracking().FirstOrDefault(m =>
            m.OrganizerUserId == organizerUserId && m.GoogleCalendarEventId == googleEventId);
    IReadOnlyList<Meeting> IMeetingRepository.ListCalendarMeetingsForBotDispatch(DateTimeOffset windowStart, DateTimeOffset windowEnd) =>
        _db.Meetings.AsNoTracking()
            .Where(m =>
                m.IsFromCalendar &&
                m.BotScheduleEnabled &&
                !m.IsCancelledFromCalendar &&
                m.BotScheduledAtUtc == null &&
                m.StartUtc != null &&
                m.StartUtc >= windowStart &&
                m.StartUtc <= windowEnd &&
                m.MeetingUrl != null &&
                m.MeetingUrl != string.Empty)
            .ToList();
    void IMeetingRepository.Upsert(Meeting meeting)
    {
        UpsertById(_db.Meetings, meeting);
        _db.SaveChanges();
    }

    IReadOnlyList<Meeting> IMeetingRepository.GetUpcoming(DateTimeOffset now, int take) =>
        _db.Meetings.AsNoTracking()
            .Where(m => m.StartUtc.HasValue && m.StartUtc >= now)
            .OrderBy(m => m.StartUtc)
            .Take(take)
            .ToList();

    IReadOnlyList<MeetingBot> IMeetingBotRepository.GetBotsForMeetingIds(IReadOnlyCollection<Guid> meetingIds)
    {
        if (meetingIds.Count == 0)
            return Array.Empty<MeetingBot>();
        var idList = meetingIds.Distinct().ToArray();
        return _db.MeetingBots.AsNoTracking().Where(b => idList.Contains(b.MeetingId)).ToList();
    }

    IReadOnlyList<MeetingBot> IMeetingBotRepository.GetByMeetingId(Guid meetingId) =>
        _db.MeetingBots.AsNoTracking().Where(b => b.MeetingId == meetingId).ToList();

    MeetingBot? IMeetingBotRepository.GetById(Guid id) =>
        _db.MeetingBots.AsNoTracking().FirstOrDefault(b => b.Id == id);

    public MeetingBot? GetByExternalBotId(string externalBotId) =>
        _db.MeetingBots.AsNoTracking().FirstOrDefault(b => b.ExternalBotId == externalBotId);

    public void Upsert(MeetingBot bot)
    {
        UpsertById(_db.MeetingBots, bot);
        _db.SaveChanges();
    }

    public void Add(BotJoinRequest request)
    {
        _db.BotJoinRequests.Add(request);
        _db.SaveChanges();
    }

    BotJoinRequest? IBotJoinRequestRepository.GetById(Guid id) =>
        _db.BotJoinRequests.AsNoTracking().FirstOrDefault(x => x.Id == id);

    public void Add(BotExecution execution)
    {
        _db.BotExecutions.Add(execution);
        _db.SaveChanges();
    }

    public IReadOnlyList<BotExecution> GetByMeetingBotId(Guid meetingBotId) =>
        _db.BotExecutions.AsNoTracking()
            .Where(e => e.MeetingBotId == meetingBotId)
            .OrderBy(e => e.AtUtc)
            .ToList();

    IReadOnlyList<RecordingAsset> IRecordingAssetRepository.GetByMeetingId(Guid meetingId) =>
        _db.RecordingAssets.AsNoTracking().Where(a => a.MeetingId == meetingId).ToList();

    public void Upsert(RecordingAsset asset)
    {
        UpsertById(_db.RecordingAssets, asset);
        _db.SaveChanges();
    }

    public void RemoveForMeeting(Guid meetingId)
    {
        var rows = _db.RecordingAssets.Where(a => a.MeetingId == meetingId).ToList();
        if (rows.Count == 0) return;
        _db.RecordingAssets.RemoveRange(rows);
        _db.SaveChanges();
    }

    Transcript? ITranscriptRepository.GetByMeetingId(Guid meetingId) =>
        _db.Transcripts.AsNoTracking().FirstOrDefault(t => t.MeetingId == meetingId);

    void ITranscriptRepository.Upsert(Transcript transcript)
    {
        UpsertById(_db.Transcripts, transcript);
        _db.SaveChanges();
    }

    public IReadOnlyList<TranscriptSegment> GetSegments(Guid transcriptId) =>
        _db.TranscriptSegments.AsNoTracking()
            .Where(s => s.TranscriptId == transcriptId)
            .OrderBy(s => s.StartSeconds)
            .ThenBy(s => s.Id)
            .ToList();

    public void ReplaceSegments(Guid transcriptId, IReadOnlyList<TranscriptSegment> segments)
    {
        var existing = _db.TranscriptSegments.Where(s => s.TranscriptId == transcriptId).ToList();
        if (existing.Count > 0)
            _db.TranscriptSegments.RemoveRange(existing);
        _db.TranscriptSegments.AddRange(segments);
        _db.SaveChanges();
    }

    MeetingSummary? IMeetingSummaryRepository.GetByMeetingId(Guid meetingId) =>
        _db.MeetingSummaries.AsNoTracking().FirstOrDefault(s => s.MeetingId == meetingId);

    public void Upsert(MeetingSummary summary)
    {
        var existingId = _db.MeetingSummaries.AsNoTracking()
            .Where(s => s.MeetingId == summary.MeetingId)
            .Select(s => (Guid?)s.Id)
            .FirstOrDefault();
        if (existingId.HasValue)
            summary.Id = existingId.Value;
        UpsertById(_db.MeetingSummaries, summary);
        _db.SaveChanges();
    }

    IReadOnlyList<KeyPoint> IKeyPointRepository.GetByMeetingId(Guid meetingId) =>
        _db.KeyPoints.AsNoTracking()
            .Where(k => k.MeetingId == meetingId)
            .OrderBy(k => k.Order)
            .ToList();

    public void ReplaceForMeeting(Guid meetingId, IReadOnlyList<KeyPoint> keyPoints)
    {
        var existing = _db.KeyPoints.Where(k => k.MeetingId == meetingId).ToList();
        if (existing.Count > 0)
            _db.KeyPoints.RemoveRange(existing);
        _db.KeyPoints.AddRange(keyPoints);
        _db.SaveChanges();
    }

    IReadOnlyList<ActionItem> IActionItemRepository.GetByMeetingId(Guid meetingId) =>
        _db.ActionItems.AsNoTracking()
            .Where(a => a.MeetingId == meetingId)
            .OrderBy(a => a.Title)
            .ToList();

    ActionItem? IActionItemRepository.GetById(Guid id) =>
        _db.ActionItems.AsNoTracking().FirstOrDefault(a => a.Id == id);

    void IActionItemRepository.Upsert(ActionItem item)
    {
        UpsertById(_db.ActionItems, item);
        _db.SaveChanges();
    }

    public void RemoveByMeetingIdAndSource(Guid meetingId, string source)
    {
        var rows = _db.ActionItems.Where(a => a.MeetingId == meetingId && a.Source == source).ToList();
        if (rows.Count == 0) return;
        _db.ActionItems.RemoveRange(rows);
        _db.SaveChanges();
    }

    public IReadOnlyList<TodoItem> GetAll(Guid? userId)
    {
        IQueryable<TodoItem> q = _db.TodoItems.AsNoTracking();
        if (userId.HasValue)
            q = q.Where(t => t.UserId == null || t.UserId == userId.Value);
        return q.OrderByDescending(t => t.CreatedAt).ToList();
    }

    TodoItem? ITodoRepository.GetById(Guid id) =>
        _db.TodoItems.AsNoTracking().FirstOrDefault(t => t.Id == id);

    public void Upsert(TodoItem item)
    {
        UpsertById(_db.TodoItems, item);
        _db.SaveChanges();
    }

    IReadOnlyList<CalendarConnection> ICalendarConnectionRepository.GetAll() =>
        _db.CalendarConnections.AsNoTracking().OrderBy(c => c.CreatedAt).ToList();

    IReadOnlyList<CalendarConnection> ICalendarConnectionRepository.ListForUser(Guid userId) =>
        _db.CalendarConnections.AsNoTracking().Where(c => c.UserId == userId).OrderBy(c => c.CreatedAt).ToList();

    CalendarConnection? ICalendarConnectionRepository.GetById(Guid id) =>
        _db.CalendarConnections.AsNoTracking().FirstOrDefault(c => c.Id == id);

    public CalendarConnection? GetByExternalId(string externalCalendarId) =>
        _db.CalendarConnections.AsNoTracking().FirstOrDefault(c => c.ExternalCalendarId == externalCalendarId);

    public void Upsert(CalendarConnection connection)
    {
        UpsertById(_db.CalendarConnections, connection);
        _db.SaveChanges();
    }

    void ICalendarConnectionRepository.Remove(Guid id)
    {
        var existing = _db.CalendarConnections.FirstOrDefault(c => c.Id == id);
        if (existing is null) return;
        _db.CalendarConnections.Remove(existing);
        _db.SaveChanges();
    }

    Workspace? IWorkspaceRepository.GetWorkspace(Guid id) =>
        _db.Workspaces.AsNoTracking().FirstOrDefault(w => w.Id == id);

    void IWorkspaceRepository.UpsertWorkspace(Workspace workspace)
    {
        UpsertById(_db.Workspaces, workspace);
        _db.SaveChanges();
    }

    IReadOnlyList<WorkspaceMember> IWorkspaceRepository.ListMembers(Guid workspaceId) =>
        _db.WorkspaceMembers.AsNoTracking().Where(m => m.WorkspaceId == workspaceId).OrderBy(m => m.CreatedAtUtc).ToList();

    WorkspaceMember? IWorkspaceRepository.FindMember(Guid workspaceId, Guid userId) =>
        _db.WorkspaceMembers.AsNoTracking().FirstOrDefault(m => m.WorkspaceId == workspaceId && m.UserId == userId);

    void IWorkspaceRepository.UpsertMember(WorkspaceMember member)
    {
        UpsertById(_db.WorkspaceMembers, member);
        _db.SaveChanges();
    }

    void IWorkspaceRepository.RemoveMember(Guid workspaceId, Guid userId)
    {
        var row = _db.WorkspaceMembers.FirstOrDefault(m => m.WorkspaceId == workspaceId && m.UserId == userId);
        if (row is null) return;
        _db.WorkspaceMembers.Remove(row);
        _db.SaveChanges();
    }

    IReadOnlyList<CalendarEvent> ICalendarEventRepository.GetByCalendarId(Guid calendarConnectionId) =>
        _db.CalendarEvents.AsNoTracking()
            .Where(e => e.CalendarConnectionId == calendarConnectionId)
            .OrderBy(e => e.StartUtc)
            .ToList();

    CalendarEvent? ICalendarEventRepository.GetById(Guid id) =>
        _db.CalendarEvents.AsNoTracking().FirstOrDefault(e => e.Id == id);

    public CalendarEvent? FindByExternal(Guid calendarConnectionId, string externalEventId) =>
        _db.CalendarEvents.AsNoTracking()
            .FirstOrDefault(e => e.CalendarConnectionId == calendarConnectionId && e.ExternalEventId == externalEventId);

    void ICalendarEventRepository.Upsert(CalendarEvent evt)
    {
        UpsertById(_db.CalendarEvents, evt);
        _db.SaveChanges();
    }

    public void UpsertMany(IReadOnlyList<CalendarEvent> events)
    {
        foreach (var evt in events)
            UpsertById(_db.CalendarEvents, evt);
        _db.SaveChanges();
    }

    public IReadOnlyList<CalendarEvent> GetUpcoming(Guid calendarConnectionId, DateTimeOffset now, int take) =>
        _db.CalendarEvents.AsNoTracking()
            .Where(e => e.CalendarConnectionId == calendarConnectionId && !e.IsCancelled && e.StartUtc >= now)
            .OrderBy(e => e.StartUtc)
            .Take(take)
            .ToList();

    public void RemoveByCalendarConnection(Guid calendarConnectionId)
    {
        var rows = _db.CalendarEvents.Where(e => e.CalendarConnectionId == calendarConnectionId).ToList();
        if (rows.Count == 0) return;
        _db.CalendarEvents.RemoveRange(rows);
        _db.SaveChanges();
    }

    IntegrationCredentials? IIntegrationCredentialsRepository.GetById(Guid id) =>
        _db.IntegrationCredentials.AsNoTracking().FirstOrDefault(c => c.Id == id);

    void IIntegrationCredentialsRepository.Upsert(IntegrationCredentials credentials)
    {
        UpsertById(_db.IntegrationCredentials, credentials);
        _db.SaveChanges();
    }

    public void Add(WebhookEvent webhookEvent)
    {
        _db.WebhookEvents.Add(webhookEvent);
        _db.SaveChanges();
    }

    public IReadOnlyList<WebhookEvent> GetRecent(int take) =>
        _db.WebhookEvents.AsNoTracking().OrderByDescending(w => w.ReceivedAt).Take(take).ToList();

    public IReadOnlyList<WebhookEvent> GetRecentContaining(string substring, int take)
    {
        var lowered = substring.ToLower();
        return _db.WebhookEvents.AsNoTracking()
            .Where(w => w.RawPayload.ToLower().Contains(lowered))
            .OrderByDescending(w => w.ReceivedAt)
            .Take(take)
            .ToList();
    }

    ProjectManagementIntegration? IProjectManagementIntegrationRepository.GetByUserAndPlatform(Guid userId, ProjectManagementPlatform platform) =>
        _db.ProjectManagementIntegrations.AsNoTracking()
            .FirstOrDefault(x => x.UserId == userId && x.Platform == platform);

    ProjectManagementIntegration? IProjectManagementIntegrationRepository.GetTrackedByUserAndPlatform(Guid userId, ProjectManagementPlatform platform) =>
        _db.ProjectManagementIntegrations
            .FirstOrDefault(x => x.UserId == userId && x.Platform == platform);

    public void Upsert(ProjectManagementIntegration integration)
    {
        UpsertById(_db.ProjectManagementIntegrations, integration);
        _db.SaveChanges();
    }

    void IProjectManagementIntegrationRepository.DeleteByUserAndPlatform(Guid userId, ProjectManagementPlatform platform)
    {
        var rows = _db.ProjectManagementIntegrations.Where(x => x.UserId == userId && x.Platform == platform).ToList();
        if (rows.Count == 0)
            return;
        _db.ProjectManagementIntegrations.RemoveRange(rows);
        _db.SaveChanges();
    }

    private void UpsertById<TEntity>(DbSet<TEntity> set, TEntity entity)
        where TEntity : class
    {
        var entry = set.Entry(entity);
        if (entry.Property("Id").CurrentValue is not Guid id)
        {
            set.Add(entity);
            return;
        }

        var tracked = set.Local.FirstOrDefault(row =>
            row is not null &&
            set.Entry(row).Property("Id").CurrentValue is Guid rowId &&
            rowId == id);
        if (tracked is not null)
            _db.Entry(tracked).State = EntityState.Detached;

        var exists = set.AsNoTracking().Any(row => EF.Property<Guid>(row, "Id") == id);
        if (exists)
            set.Update(entity);
        else
            set.Add(entity);
    }
}
