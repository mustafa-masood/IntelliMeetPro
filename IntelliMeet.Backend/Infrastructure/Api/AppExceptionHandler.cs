using Microsoft.AspNetCore.Diagnostics;

namespace IntelliMeet.Backend.Infrastructure.Api;

public sealed class AppExceptionHandler : IExceptionHandler
{
    private readonly ILogger<AppExceptionHandler> _logger;

    public AppExceptionHandler(ILogger<AppExceptionHandler> logger) => _logger = logger;

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Unhandled exception");
        (int status, string title) = exception switch
        {
            KeyNotFoundException => (StatusCodes.Status404NotFound, exception.Message),
            ArgumentException => (StatusCodes.Status400BadRequest, exception.Message),
            InvalidOperationException => (StatusCodes.Status400BadRequest, exception.Message),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred.")
        };
        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(new { success = false, error = title }, cancellationToken).ConfigureAwait(false);
        return true;
    }
}
