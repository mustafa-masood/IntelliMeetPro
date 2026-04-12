namespace IntelliMeet.Backend.Application.DTOs;

public sealed class ApiEnvelope<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Error { get; init; }

    public static ApiEnvelope<T> Ok(T data) => new() { Success = true, Data = data };
    public static ApiEnvelope<T> Fail(string error) => new() { Success = false, Error = error };
}
