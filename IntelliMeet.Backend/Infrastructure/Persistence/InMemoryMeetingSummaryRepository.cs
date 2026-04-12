using System.Collections.Concurrent;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Infrastructure.Persistence;

public sealed class InMemoryMeetingSummaryRepository : IMeetingSummaryRepository
{
    private readonly ConcurrentDictionary<Guid, MeetingSummary> _byMeeting = new();

    public MeetingSummary? GetByMeetingId(Guid meetingId) => _byMeeting.GetValueOrDefault(meetingId);

    public void Upsert(MeetingSummary summary) => _byMeeting[summary.MeetingId] = summary;
}
