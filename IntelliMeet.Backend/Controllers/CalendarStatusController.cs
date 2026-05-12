using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.DTOs;
using IntelliMeet.Backend.Infrastructure.Api;
using IntelliMeet.Backend.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("api/calendar")]
public sealed class CalendarStatusController : ControllerBase
{
    private readonly IUserRepository _users;
    private readonly ICalendarConnectionRepository _connections;
    private readonly IOptions<IntegrationsOptions> _integrationOptions;

    public CalendarStatusController(
        IUserRepository users,
        ICalendarConnectionRepository connections,
        IOptions<IntegrationsOptions> integrationOptions)
    {
        _users = users;
        _connections = connections;
        _integrationOptions = integrationOptions;
    }

    [HttpGet("status")]
    public ActionResult<CalendarMbaasStatusDto> Status()
    {
        var userId = IntegrationUserResolver.ResolveUserId(Request, _integrationOptions);
        var user = _users.GetById(userId);
        if (user is null)
        {
            return Ok(new CalendarMbaasStatusDto
            {
                IsConnected = false,
                Provider = null,
                CalendarId = null,
                LocalConnectionId = null
            });
        }

        var local = _connections.ListForUser(userId).FirstOrDefault();
        return Ok(new CalendarMbaasStatusDto
        {
            IsConnected = user.IsCalendarConnected,
            Provider = user.CalendarProvider,
            CalendarId = user.MeetingBaasCalendarId,
            LocalConnectionId = local?.Id
        });
    }
}
