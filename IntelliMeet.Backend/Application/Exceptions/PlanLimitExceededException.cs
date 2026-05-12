namespace IntelliMeet.Backend.Application.Exceptions;

public sealed class PlanLimitExceededException : Exception
{
    public string Code { get; }

    public PlanLimitExceededException(string code, string message) : base(message) => Code = code;
}
