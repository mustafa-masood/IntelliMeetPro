using System.Security.Claims;
using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.Services;
using IntelliMeet.Backend.Controllers;
using IntelliMeet.Backend.Infrastructure.Api;
using IntelliMeet.Backend.Infrastructure.GoogleAuth;
using IntelliMeet.Backend.Infrastructure.GoogleCalendar;
using IntelliMeet.Backend.Infrastructure.MeetingBaas;
using IntelliMeet.Backend.Infrastructure.Ollama;
using IntelliMeet.Backend.Infrastructure.Persistence;
using IntelliMeet.Backend.Infrastructure.Rag;
using IntelliMeet.Backend.Options;
using IntelliMeet.Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.local.json", optional: true, reloadOnChange: true);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "IntelliMeet API",
        Version = "v1",
        Description = "In-memory demo backend with Meeting BaaS v2 integration. See BACKEND.md."
    });
});
builder.Services.AddExceptionHandler<AppExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.Configure<OllamaOptions>(builder.Configuration.GetSection(OllamaOptions.SectionName));
builder.Services.Configure<MeetingBaasPollingOptions>(builder.Configuration.GetSection(MeetingBaasPollingOptions.SectionName));
builder.Services.Configure<MeetingBaasOptions>(builder.Configuration.GetSection(MeetingBaasOptions.SectionName));
builder.Services.Configure<GoogleOAuthOptions>(builder.Configuration.GetSection(GoogleOAuthOptions.SectionName));
builder.Services.Configure<GoogleOptions>(builder.Configuration.GetSection(GoogleOptions.SectionName));
builder.Services.Configure<RuntimeOptions>(builder.Configuration.GetSection(RuntimeOptions.SectionName));
builder.Services.Configure<ReliabilityOptions>(builder.Configuration.GetSection(ReliabilityOptions.SectionName));
builder.Services.Configure<VoyageOptions>(builder.Configuration.GetSection(VoyageOptions.SectionName));
builder.Services.Configure<PineconeOptions>(builder.Configuration.GetSection(PineconeOptions.SectionName));
builder.Services.Configure<RagOptions>(builder.Configuration.GetSection(RagOptions.SectionName));
builder.Services.Configure<AsanaOptions>(builder.Configuration.GetSection(AsanaOptions.SectionName));
builder.Services.Configure<JiraOptions>(builder.Configuration.GetSection(JiraOptions.SectionName));
builder.Services.Configure<TrelloOptions>(builder.Configuration.GetSection(TrelloOptions.SectionName));
builder.Services.Configure<IntegrationsOptions>(builder.Configuration.GetSection(IntegrationsOptions.SectionName));
builder.Services.Configure<ClerkOptions>(builder.Configuration.GetSection(ClerkOptions.SectionName));
builder.Services.Configure<StripeOptions>(builder.Configuration.GetSection(StripeOptions.SectionName));
builder.Services.Configure<PlanLimitsOptions>(builder.Configuration.GetSection(PlanLimitsOptions.SectionName));
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();

var clerkCfg = builder.Configuration.GetSection(ClerkOptions.SectionName).Get<ClerkOptions>() ?? new ClerkOptions();
if (clerkCfg.Enabled)
{
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = clerkCfg.Authority.TrimEnd('/');
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = !string.IsNullOrWhiteSpace(clerkCfg.Audience),
                ValidAudience = clerkCfg.Audience,
                NameClaimType = ClaimTypes.NameIdentifier
            };
        });
}
else
{
    builder.Services.AddAuthentication();
}
builder.Services.AddDbContext<IntelliMeetDbContext>(opt =>
{
    var cs = builder.Configuration.GetConnectionString("Postgres")
             ?? builder.Configuration["Persistence:PostgresConnectionString"]
             ?? "Host=localhost;Port=5432;Database=intellimeet;Username=postgres;Password=postgres";
    opt.UseNpgsql(cs);
});
builder.Services.AddDbContextFactory<IntelliMeetDbContext>(opt =>
{
    var cs = builder.Configuration.GetConnectionString("Postgres")
             ?? builder.Configuration["Persistence:PostgresConnectionString"]
             ?? "Host=localhost;Port=5432;Database=intellimeet;Username=postgres;Password=postgres";
    opt.UseNpgsql(cs);
}, ServiceLifetime.Scoped);
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddScoped<IMeetingBaasArtifactApplier, MeetingBaasArtifactApplier>();
builder.Services.AddSingleton<ITranscriptAnalysisBackgroundTrigger, TranscriptAnalysisBackgroundTrigger>();

builder.Services.AddHttpClient<IOllamaChatCompletionsClient, OllamaChatCompletionsClient>((sp, client) =>
{
    var o = sp.GetRequiredService<IOptions<OllamaOptions>>().Value;
    var perAttempt = Math.Clamp(o.ChatTimeoutSeconds, 15, 600);
    var retries = Math.Clamp(o.ChatMaxRetries, 0, 5);
    var baseDelay = Math.Clamp(o.ChatRetryBaseDelayMs, 50, 30_000);
    var backoffMs = 0;
    for (var i = 0; i < retries; i++)
        backoffMs += (int)Math.Min(baseDelay * Math.Pow(2, i), 60_000);
    var totalMs = perAttempt * 1000L * (retries + 1) + backoffMs;
    client.Timeout = TimeSpan.FromMilliseconds(Math.Clamp(totalMs, 30_000, 600_000));
});

builder.Services.AddHttpClient(nameof(HealthController));

builder.Services.AddScoped<ITextAnalysisService, OllamaTextAnalysisService>();
builder.Services.AddHttpClient<ITranscriptionService, WhisperXTranscriptionService>(client =>
{
    client.Timeout = TimeSpan.FromMinutes(10);
});

builder.Services.AddHttpClient(nameof(TranscriptTextResolver), client =>
{
    client.Timeout = TimeSpan.FromMinutes(3);
});
builder.Services.AddScoped<ITranscriptTextResolver, TranscriptTextResolver>();

builder.Services.AddScoped<IMeetingTranscriptAnalysisService, MeetingTranscriptAnalysisService>();
builder.Services.AddSingleton<MeetingAnalysisQueue>();
builder.Services.AddSingleton<IMeetingAnalysisQueue>(sp => sp.GetRequiredService<MeetingAnalysisQueue>());
builder.Services.AddHostedService<MeetingAnalysisBackgroundService>();
builder.Services.AddScoped<IMeetingBaasStateSynchronizer, MeetingBaasStateSynchronizer>();

builder.Services.AddHttpClient<IMeetingBaasClient, MeetingBaasClient>();
builder.Services.AddHttpClient<IGoogleOAuthService, GoogleOAuthService>();
builder.Services.AddHttpClient<IGoogleCalendarClient, GoogleCalendarClient>();
builder.Services.AddHttpClient<IEmbeddingClient, VoyageEmbeddingClient>((sp, client) =>
{
    var o = sp.GetRequiredService<IOptions<VoyageOptions>>().Value;
    var baseUrl = string.IsNullOrWhiteSpace(o.BaseUrl) ? "https://api.voyageai.com/v1" : o.BaseUrl;
    client.BaseAddress = new Uri(baseUrl.EndsWith('/') ? baseUrl : baseUrl + "/");
    client.Timeout = TimeSpan.FromSeconds(60);
});

var pineconeForRegistration = builder.Configuration.GetSection(PineconeOptions.SectionName).Get<PineconeOptions>() ?? new PineconeOptions();
if (PineconeDataPlaneUri.TryCreateBaseUri(pineconeForRegistration, out _))
{
    builder.Services.AddHttpClient<IPineconeVectorStore, PineconeVectorStore>((sp, client) =>
    {
        var o = sp.GetRequiredService<IOptions<PineconeOptions>>().Value;
        if (!PineconeDataPlaneUri.TryCreateBaseUri(o, out var baseUri))
            throw new InvalidOperationException("Pinecone data-plane URI is invalid; check Pinecone:IndexName and Pinecone:Environment.");
        client.BaseAddress = baseUri;
        client.Timeout = TimeSpan.FromSeconds(60);
    });
}
else
{
    builder.Services.AddSingleton<IPineconeVectorStore, NoOpPineconeVectorStore>();
}

builder.Services.AddScoped<EfRepositoryStore>();
builder.Services.AddScoped<IUserRepository>(sp => sp.GetRequiredService<EfRepositoryStore>());
builder.Services.AddScoped<IMeetingRepository>(sp => sp.GetRequiredService<EfRepositoryStore>());
builder.Services.AddScoped<IMeetingBotRepository>(sp => sp.GetRequiredService<EfRepositoryStore>());
builder.Services.AddScoped<IBotJoinRequestRepository>(sp => sp.GetRequiredService<EfRepositoryStore>());
builder.Services.AddScoped<IBotExecutionRepository>(sp => sp.GetRequiredService<EfRepositoryStore>());
builder.Services.AddScoped<IRecordingAssetRepository>(sp => sp.GetRequiredService<EfRepositoryStore>());
builder.Services.AddScoped<ITranscriptRepository>(sp => sp.GetRequiredService<EfRepositoryStore>());
builder.Services.AddScoped<IMeetingSummaryRepository>(sp => sp.GetRequiredService<EfRepositoryStore>());
builder.Services.AddScoped<IKeyPointRepository>(sp => sp.GetRequiredService<EfRepositoryStore>());
builder.Services.AddScoped<IActionItemRepository>(sp => sp.GetRequiredService<EfRepositoryStore>());
builder.Services.AddScoped<ITodoRepository>(sp => sp.GetRequiredService<EfRepositoryStore>());
builder.Services.AddScoped<ICalendarConnectionRepository>(sp => sp.GetRequiredService<EfRepositoryStore>());
builder.Services.AddScoped<ICalendarEventRepository>(sp => sp.GetRequiredService<EfRepositoryStore>());
builder.Services.AddScoped<IIntegrationCredentialsRepository>(sp => sp.GetRequiredService<EfRepositoryStore>());
builder.Services.AddScoped<IWebhookEventRepository>(sp => sp.GetRequiredService<EfRepositoryStore>());
builder.Services.AddScoped<IProjectManagementIntegrationRepository>(sp => sp.GetRequiredService<EfRepositoryStore>());
builder.Services.AddScoped<IWorkspaceRepository>(sp => sp.GetRequiredService<EfRepositoryStore>());
builder.Services.AddScoped<IMeetingTeamResolver, MeetingTeamResolver>();
builder.Services.AddScoped<ICurrentUserContext, CurrentUserContext>();
builder.Services.AddScoped<IUsageEntitlementService, UsageEntitlementService>();
builder.Services.AddSingleton<IMeetingFlowCoordinationStore, InMemoryMeetingFlowCoordinationStore>();

builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IMeetingsApiService, MeetingsApiService>();
builder.Services.AddScoped<ICalendarWorkflowService, CalendarWorkflowService>();
builder.Services.AddScoped<ITodoWorkflowService, TodoWorkflowService>();
builder.Services.AddScoped<IMeetingBaasWebhookProcessor, MeetingBaasWebhookProcessor>();
builder.Services.AddScoped<IMeetingRagIndexerService, MeetingRagIndexerService>();
builder.Services.AddScoped<IMeetingRagService, MeetingRagService>();
builder.Services.AddScoped<IIntegrationTokenService, IntegrationTokenService>();
builder.Services.AddScoped<IIntegrationWorkflowService, IntegrationWorkflowService>();

builder.Services.AddHostedService<MeetingBaasPollingBackgroundService>();
builder.Services.AddHostedService<SubscriptionInactiveSweepService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var sp = scope.ServiceProvider;
    var db = sp.GetRequiredService<IntelliMeetDbContext>();
    db.Database.Migrate();
    var runtime = sp.GetRequiredService<IOptions<RuntimeOptions>>().Value;
    if (runtime.SeedDemoData)
    {
        InMemoryDataSeeder.Seed(
            sp.GetRequiredService<IUserRepository>(),
            sp.GetRequiredService<IWorkspaceRepository>(),
            sp.GetRequiredService<IMeetingRepository>(),
            sp.GetRequiredService<IMeetingBotRepository>(),
            sp.GetRequiredService<ITranscriptRepository>(),
            sp.GetRequiredService<IMeetingSummaryRepository>(),
            sp.GetRequiredService<IKeyPointRepository>(),
            sp.GetRequiredService<IActionItemRepository>(),
            sp.GetRequiredService<ITodoRepository>());
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseForwardedHeaders();
app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors();
app.UseAuthentication();
app.UseMiddleware<RequestUserMiddleware>();
app.UseAuthorization();
app.MapControllers();
app.Run();
