using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Domain.Entities;

public sealed class Workspace
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public WorkspacePlan Plan { get; set; } = WorkspacePlan.Basic;
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
}
