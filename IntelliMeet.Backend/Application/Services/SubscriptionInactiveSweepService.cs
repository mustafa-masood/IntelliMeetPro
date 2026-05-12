using IntelliMeet.Backend.Domain.Enums;
using IntelliMeet.Backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace IntelliMeet.Backend.Application.Services;

/// <summary>Daily transition cancelled subscriptions past <see cref="Domain.Entities.User.PlanEndDateUtc"/> to <see cref="BillingSubscriptionStatus.Inactive"/>.</summary>
public sealed class SubscriptionInactiveSweepService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SubscriptionInactiveSweepService> _logger;

    public SubscriptionInactiveSweepService(IServiceScopeFactory scopeFactory, ILogger<SubscriptionInactiveSweepService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = _scopeFactory.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<IntelliMeetDbContext>();
                var now = DateTimeOffset.UtcNow;
                var rows = await db.Users
                    .Where(u =>
                        u.SubscriptionStatus == BillingSubscriptionStatus.Cancelled &&
                        u.PlanEndDateUtc != null &&
                        u.PlanEndDateUtc < now)
                    .ToListAsync(stoppingToken).ConfigureAwait(false);
                foreach (var u in rows)
                {
                    u.SubscriptionStatus = BillingSubscriptionStatus.Inactive;
                }
                if (rows.Count > 0)
                    await db.SaveChangesAsync(stoppingToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Subscription inactive sweep failed");
            }

            try
            {
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken).ConfigureAwait(false);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }
}
