using IntelliMeet.Backend.Domain.Entities;

namespace IntelliMeet.Backend.Application.Services;

public interface IUsageEntitlementService
{
    (bool ok, string? code, string? message) CanRunMeetingAnalysis(User organizer);
    void RecordMeetingAnalysis(User organizer);
    (bool ok, string? code, string? message) CanRunChat(User user);
    void RecordChat(User user);
}
