using System.Net;
using System.Text;
using IntelliMeet.Backend.Application.Services;
using IntelliMeet.Backend.Infrastructure.MeetingBaas;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Svix;

namespace IntelliMeet.Backend.Controllers;

[ApiController]
[Route("api/webhooks/meetingbaas")]
public class MeetingBaasWebhooksController : ControllerBase
{
    private readonly IMeetingBaasWebhookProcessor _processor;
    private readonly MeetingBaasOptions _options;
    private readonly ILogger<MeetingBaasWebhooksController> _logger;

    public MeetingBaasWebhooksController(
        IMeetingBaasWebhookProcessor processor,
        IOptions<MeetingBaasOptions> options,
        ILogger<MeetingBaasWebhooksController> logger)
    {
        _processor = processor;
        _options = options.Value;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Post(CancellationToken ct)
    {
        Request.EnableBuffering();
        string body;
        using (var reader = new StreamReader(Request.Body, Encoding.UTF8, detectEncodingFromByteOrderMarks: false, leaveOpen: true))
        {
            body = await reader.ReadToEndAsync(ct).ConfigureAwait(false);
        }
        Request.Body.Position = 0;

        if (!string.IsNullOrEmpty(_options.WebhookSigningSecret))
        {
            try
            {
                var headers = new WebHeaderCollection();
                foreach (var h in Request.Headers)
                {
                    if (h.Key.StartsWith(":", StringComparison.Ordinal))
                        continue;
                    if (h.Value.Count == 0)
                        continue;
                    var joined = h.Value.Count == 1 ? h.Value.ToString() : string.Join(',', h.Value.ToArray());
                    headers.Set(h.Key, joined);
                }

                new Webhook(_options.WebhookSigningSecret).Verify(body, headers);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "SVIX webhook verification failed");
                return Unauthorized();
            }
        }

        Request.Headers.TryGetValue("svix-id", out var svixId);
        var result = await _processor.ProcessAsync(body, svixId.ToString(), ct).ConfigureAwait(false);
        return result.Accepted ? Ok(new { success = true }) : BadRequest();
    }
}
