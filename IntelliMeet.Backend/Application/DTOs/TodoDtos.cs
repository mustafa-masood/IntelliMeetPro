using System.ComponentModel.DataAnnotations;
using IntelliMeet.Backend.Domain.Enums;

namespace IntelliMeet.Backend.Application.DTOs;

public sealed class TodoItemDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Type { get; init; } = string.Empty;
    public DateTimeOffset? DueDate { get; init; }
    public TodoStatus Status { get; init; }
    public Guid? SourceMeetingId { get; init; }
    public Guid? SourceActionItemId { get; init; }
}

public sealed class CreateTodoRequestDto
{
    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(100)]
    public string Type { get; set; } = "manual";

    public DateTimeOffset? DueDate { get; set; }
    public Guid? UserId { get; set; }
}

public sealed class PatchTodoRequestDto
{
    public TodoStatus? Status { get; set; }

    [MaxLength(500)]
    public string? Title { get; set; }

    public DateTimeOffset? DueDate { get; set; }
}

public sealed class TodoFromActionItemRequestDto
{
    [Required]
    public Guid MeetingId { get; set; }

    [Required]
    public Guid ActionItemId { get; set; }

    public Guid? UserId { get; set; }
    public string? Type { get; set; }
}
