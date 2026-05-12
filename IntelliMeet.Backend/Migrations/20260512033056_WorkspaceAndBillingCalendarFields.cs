using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IntelliMeet.Backend.Migrations
{
    /// <inheritdoc />
    public partial class WorkspaceAndBillingCalendarFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CalendarProvider",
                table: "Users",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ChatMessagesThisMonth",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CurrentPlan",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ExternalAuthProvider",
                table: "Users",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalUserId",
                table: "Users",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCalendarConnected",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "MeetingBaasCalendarId",
                table: "Users",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MeetingsThisMonth",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "PlanEndDateUtc",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeCustomerId",
                table: "Users",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeSubscriptionId",
                table: "Users",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SubscriptionStatus",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "WorkspaceId",
                table: "Users",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "WorkspaceId",
                table: "ProjectManagementIntegrations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "WorkspaceId",
                table: "Meetings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AssignedUserId",
                table: "ActionItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<float>(
                name: "SuggestedAssigneeConfidence",
                table: "ActionItems",
                type: "real",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SuggestedAssigneeName",
                table: "ActionItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "WorkspaceId",
                table: "ActionItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "WorkspaceMembers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkspaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkspaceMembers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Workspaces",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Plan = table.Column<int>(type: "integer", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Workspaces", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Users_ExternalUserId",
                table: "Users",
                column: "ExternalUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_StripeCustomerId",
                table: "Users",
                column: "StripeCustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectManagementIntegrations_WorkspaceId",
                table: "ProjectManagementIntegrations",
                column: "WorkspaceId");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_WorkspaceId",
                table: "Meetings",
                column: "WorkspaceId");

            migrationBuilder.CreateIndex(
                name: "IX_ActionItems_WorkspaceId",
                table: "ActionItems",
                column: "WorkspaceId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkspaceMembers_WorkspaceId_UserId",
                table: "WorkspaceMembers",
                columns: new[] { "WorkspaceId", "UserId" },
                unique: true);

            migrationBuilder.Sql(
                """
                DO $$
                DECLARE
                  r RECORD;
                  ws_id uuid;
                BEGIN
                  FOR r IN SELECT "Id", "DisplayName" FROM "Users" WHERE "WorkspaceId" IS NULL
                  LOOP
                    ws_id := gen_random_uuid();
                    INSERT INTO "Workspaces" ("Id", "Name", "Plan", "CreatedAtUtc", "UpdatedAtUtc")
                    VALUES (ws_id, format('%s''s workspace', r."DisplayName"), 0, NOW(), NOW());
                    UPDATE "Users" SET "WorkspaceId" = ws_id WHERE "Id" = r."Id";
                    INSERT INTO "WorkspaceMembers" ("Id", "WorkspaceId", "UserId", "Role", "CreatedAtUtc")
                    VALUES (gen_random_uuid(), ws_id, r."Id", 0, NOW());
                  END LOOP;
                END $$;

                UPDATE "Meetings" m
                SET "WorkspaceId" = u."WorkspaceId"
                FROM "Users" u
                WHERE m."OrganizerUserId" = u."Id" AND m."WorkspaceId" IS NULL AND u."WorkspaceId" IS NOT NULL;

                UPDATE "ActionItems" ai
                SET "WorkspaceId" = m."WorkspaceId"
                FROM "Meetings" m
                WHERE ai."MeetingId" = m."Id" AND ai."WorkspaceId" IS NULL AND m."WorkspaceId" IS NOT NULL;

                UPDATE "ProjectManagementIntegrations" p
                SET "WorkspaceId" = u."WorkspaceId"
                FROM "Users" u
                WHERE p."UserId" = u."Id" AND p."WorkspaceId" IS NULL AND u."WorkspaceId" IS NOT NULL;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WorkspaceMembers");

            migrationBuilder.DropTable(
                name: "Workspaces");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_ExternalUserId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_StripeCustomerId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_ProjectManagementIntegrations_WorkspaceId",
                table: "ProjectManagementIntegrations");

            migrationBuilder.DropIndex(
                name: "IX_Meetings_WorkspaceId",
                table: "Meetings");

            migrationBuilder.DropIndex(
                name: "IX_ActionItems_WorkspaceId",
                table: "ActionItems");

            migrationBuilder.DropColumn(
                name: "CalendarProvider",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ChatMessagesThisMonth",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CurrentPlan",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ExternalAuthProvider",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ExternalUserId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsCalendarConnected",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "MeetingBaasCalendarId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "MeetingsThisMonth",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PlanEndDateUtc",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "StripeCustomerId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "StripeSubscriptionId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SubscriptionStatus",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "WorkspaceId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "WorkspaceId",
                table: "ProjectManagementIntegrations");

            migrationBuilder.DropColumn(
                name: "WorkspaceId",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "AssignedUserId",
                table: "ActionItems");

            migrationBuilder.DropColumn(
                name: "SuggestedAssigneeConfidence",
                table: "ActionItems");

            migrationBuilder.DropColumn(
                name: "SuggestedAssigneeName",
                table: "ActionItems");

            migrationBuilder.DropColumn(
                name: "WorkspaceId",
                table: "ActionItems");
        }
    }
}
