using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IntelliMeet.Backend.Migrations
{
    /// <inheritdoc />
    public partial class Phase3InitialPostgres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ActionItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MeetingId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Owner = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    DueDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    AddToTodoChecked = table.Column<bool>(type: "boolean", nullable: false),
                    LinkedTodoItemId = table.Column<Guid>(type: "uuid", nullable: true),
                    Source = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActionItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BotExecutions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MeetingBotId = table.Column<Guid>(type: "uuid", nullable: false),
                    Phase = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Detail = table.Column<string>(type: "text", nullable: true),
                    AtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BotExecutions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BotJoinRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    MeetingUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    BotName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    RequestedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ResultingExternalBotId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    ResultingMeetingId = table.Column<Guid>(type: "uuid", nullable: true),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BotJoinRequests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CalendarConnections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Provider = table.Column<int>(type: "integer", nullable: false),
                    ExternalCalendarId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    RawCalendarId = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    OAuthRefreshToken = table.Column<string>(type: "text", nullable: false),
                    IntegrationCredentialsId = table.Column<Guid>(type: "uuid", nullable: false),
                    AccountEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Status = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    LastSyncedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CalendarConnections", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CalendarEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CalendarConnectionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalEventId = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    SeriesId = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Title = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    StartUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    EndUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    MeetingUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    IsRecurring = table.Column<bool>(type: "boolean", nullable: false),
                    IsCancelled = table.Column<bool>(type: "boolean", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LinkedMeetingId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CalendarEvents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "IntegrationCredentials",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Provider = table.Column<int>(type: "integer", nullable: false),
                    OAuthClientId = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    OAuthClientSecret = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    OAuthTenantId = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IntegrationCredentials", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KeyPoints",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MeetingId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KeyPoints", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MeetingBots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MeetingId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalBotId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    TranscriptionStatus = table.Column<int>(type: "integer", nullable: false),
                    IsScheduled = table.Column<bool>(type: "boolean", nullable: false),
                    JoinAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeetingBots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Meetings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizerUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Title = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    Platform = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    MeetingUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    StartUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    EndUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Participants = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CalendarEventId = table.Column<Guid>(type: "uuid", nullable: true),
                    TranscriptAnalysisCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    ProcessingStatus = table.Column<int>(type: "integer", nullable: false),
                    AnalysisError = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Meetings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MeetingSummaries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MeetingId = table.Column<Guid>(type: "uuid", nullable: false),
                    ShortSummary = table.Column<string>(type: "text", nullable: false),
                    StructuredSections = table.Column<string>(type: "text", nullable: false),
                    Decisions = table.Column<string>(type: "text", nullable: false),
                    Risks = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeetingSummaries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RecordingAssets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MeetingId = table.Column<Guid>(type: "uuid", nullable: false),
                    Kind = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Url = table.Column<string>(type: "character varying(4096)", maxLength: 4096, nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecordingAssets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TodoItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Title = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Type = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    DueDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    SourceMeetingId = table.Column<Guid>(type: "uuid", nullable: true),
                    SourceActionItemId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TodoItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Transcripts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MeetingId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RawText = table.Column<string>(type: "text", nullable: true),
                    ExternalTranscriptionUrl = table.Column<string>(type: "character varying(4096)", maxLength: 4096, nullable: true),
                    ExternalRawTranscriptionUrl = table.Column<string>(type: "character varying(4096)", maxLength: 4096, nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transcripts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TranscriptSegments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TranscriptId = table.Column<Guid>(type: "uuid", nullable: false),
                    Speaker = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    StartSeconds = table.Column<double>(type: "double precision", nullable: false),
                    EndSeconds = table.Column<double>(type: "double precision", nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TranscriptSegments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    DisplayName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WebhookEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EventType = table.Column<int>(type: "integer", nullable: false),
                    RawPayload = table.Column<string>(type: "text", nullable: false),
                    ExternalMessageId = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Processed = table.Column<bool>(type: "boolean", nullable: false),
                    ProcessingNote = table.Column<string>(type: "text", nullable: true),
                    ReceivedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebhookEvents", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ActionItems_MeetingId",
                table: "ActionItems",
                column: "MeetingId");

            migrationBuilder.CreateIndex(
                name: "IX_ActionItems_MeetingId_Source",
                table: "ActionItems",
                columns: new[] { "MeetingId", "Source" });

            migrationBuilder.CreateIndex(
                name: "IX_BotExecutions_AtUtc",
                table: "BotExecutions",
                column: "AtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_BotExecutions_MeetingBotId",
                table: "BotExecutions",
                column: "MeetingBotId");

            migrationBuilder.CreateIndex(
                name: "IX_CalendarConnections_ExternalCalendarId",
                table: "CalendarConnections",
                column: "ExternalCalendarId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CalendarConnections_UserId",
                table: "CalendarConnections",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CalendarEvents_CalendarConnectionId",
                table: "CalendarEvents",
                column: "CalendarConnectionId");

            migrationBuilder.CreateIndex(
                name: "IX_CalendarEvents_CalendarConnectionId_ExternalEventId",
                table: "CalendarEvents",
                columns: new[] { "CalendarConnectionId", "ExternalEventId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CalendarEvents_StartUtc",
                table: "CalendarEvents",
                column: "StartUtc");

            migrationBuilder.CreateIndex(
                name: "IX_KeyPoints_MeetingId",
                table: "KeyPoints",
                column: "MeetingId");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingBots_ExternalBotId",
                table: "MeetingBots",
                column: "ExternalBotId");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingBots_MeetingId",
                table: "MeetingBots",
                column: "MeetingId");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_CalendarEventId",
                table: "Meetings",
                column: "CalendarEventId");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_OrganizerUserId",
                table: "Meetings",
                column: "OrganizerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_StartUtc",
                table: "Meetings",
                column: "StartUtc");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingSummaries_MeetingId",
                table: "MeetingSummaries",
                column: "MeetingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecordingAssets_MeetingId",
                table: "RecordingAssets",
                column: "MeetingId");

            migrationBuilder.CreateIndex(
                name: "IX_TodoItems_SourceMeetingId",
                table: "TodoItems",
                column: "SourceMeetingId");

            migrationBuilder.CreateIndex(
                name: "IX_TodoItems_UserId",
                table: "TodoItems",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Transcripts_MeetingId",
                table: "Transcripts",
                column: "MeetingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TranscriptSegments_TranscriptId",
                table: "TranscriptSegments",
                column: "TranscriptId");

            migrationBuilder.CreateIndex(
                name: "IX_WebhookEvents_ExternalMessageId",
                table: "WebhookEvents",
                column: "ExternalMessageId");

            migrationBuilder.CreateIndex(
                name: "IX_WebhookEvents_ReceivedAt",
                table: "WebhookEvents",
                column: "ReceivedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActionItems");

            migrationBuilder.DropTable(
                name: "BotExecutions");

            migrationBuilder.DropTable(
                name: "BotJoinRequests");

            migrationBuilder.DropTable(
                name: "CalendarConnections");

            migrationBuilder.DropTable(
                name: "CalendarEvents");

            migrationBuilder.DropTable(
                name: "IntegrationCredentials");

            migrationBuilder.DropTable(
                name: "KeyPoints");

            migrationBuilder.DropTable(
                name: "MeetingBots");

            migrationBuilder.DropTable(
                name: "Meetings");

            migrationBuilder.DropTable(
                name: "MeetingSummaries");

            migrationBuilder.DropTable(
                name: "RecordingAssets");

            migrationBuilder.DropTable(
                name: "TodoItems");

            migrationBuilder.DropTable(
                name: "Transcripts");

            migrationBuilder.DropTable(
                name: "TranscriptSegments");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "WebhookEvents");
        }
    }
}
