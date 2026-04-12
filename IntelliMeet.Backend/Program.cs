using IntelliMeet.Backend.Application.Abstractions;
using IntelliMeet.Backend.Application.Services;
using IntelliMeet.Backend.Infrastructure.Api;
using IntelliMeet.Backend.Infrastructure.GoogleAuth;
using IntelliMeet.Backend.Infrastructure.MeetingBaas;
using IntelliMeet.Backend.Infrastructure.Persistence;
using IntelliMeet.Backend.Options;
using IntelliMeet.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

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

builder.Services.Configure<OllamaOptions>(builder.Configuration.GetSection("Ollama"));
builder.Services.Configure<MeetingBaasOptions>(builder.Configuration.GetSection(MeetingBaasOptions.SectionName));
builder.Services.Configure<GoogleOAuthOptions>(builder.Configuration.GetSection(GoogleOAuthOptions.SectionName));

builder.Services.AddHttpClient<ITextAnalysisService, OllamaTextAnalysisService>();
builder.Services.AddHttpClient<ITranscriptionService, WhisperXTranscriptionService>(client =>
{
    client.Timeout = TimeSpan.FromMinutes(10);
});

builder.Services.AddHttpClient<IMeetingBaasClient, MeetingBaasClient>();
builder.Services.AddHttpClient<IGoogleOAuthService, GoogleOAuthService>();

// Repositories — swap for EF Core DbContext + implementations when adding PostgreSQL.
builder.Services.AddSingleton<IUserRepository, InMemoryUserRepository>();
builder.Services.AddSingleton<IMeetingRepository, InMemoryMeetingRepository>();
builder.Services.AddSingleton<IMeetingBotRepository, InMemoryMeetingBotRepository>();
builder.Services.AddSingleton<IBotJoinRequestRepository, InMemoryBotJoinRequestRepository>();
builder.Services.AddSingleton<IBotExecutionRepository, InMemoryBotExecutionRepository>();
builder.Services.AddSingleton<IRecordingAssetRepository, InMemoryRecordingAssetRepository>();
builder.Services.AddSingleton<ITranscriptRepository, InMemoryTranscriptRepository>();
builder.Services.AddSingleton<IMeetingSummaryRepository, InMemoryMeetingSummaryRepository>();
builder.Services.AddSingleton<IKeyPointRepository, InMemoryKeyPointRepository>();
builder.Services.AddSingleton<IActionItemRepository, InMemoryActionItemRepository>();
builder.Services.AddSingleton<ITodoRepository, InMemoryTodoRepository>();
builder.Services.AddSingleton<ICalendarConnectionRepository, InMemoryCalendarConnectionRepository>();
builder.Services.AddSingleton<ICalendarEventRepository, InMemoryCalendarEventRepository>();
builder.Services.AddSingleton<IIntegrationCredentialsRepository, InMemoryIntegrationCredentialsRepository>();
builder.Services.AddSingleton<IWebhookEventRepository, InMemoryWebhookEventRepository>();

builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IMeetingsApiService, MeetingsApiService>();
builder.Services.AddScoped<ICalendarWorkflowService, CalendarWorkflowService>();
builder.Services.AddScoped<ITodoWorkflowService, TodoWorkflowService>();
builder.Services.AddScoped<IMeetingBaasWebhookProcessor, MeetingBaasWebhookProcessor>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var sp = scope.ServiceProvider;
    InMemoryDataSeeder.Seed(
        sp.GetRequiredService<IUserRepository>(),
        sp.GetRequiredService<IMeetingRepository>(),
        sp.GetRequiredService<IMeetingBotRepository>(),
        sp.GetRequiredService<ITranscriptRepository>(),
        sp.GetRequiredService<IMeetingSummaryRepository>(),
        sp.GetRequiredService<IKeyPointRepository>(),
        sp.GetRequiredService<IActionItemRepository>(),
        sp.GetRequiredService<ITodoRepository>());
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseAuthorization();
app.UseCors();
app.MapControllers();
app.Run();
