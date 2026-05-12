using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IntelliMeet.Backend.Migrations
{
    /// <inheritdoc />
    public partial class EnterpriseTeamsSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TeamId",
                table: "WorkspaceMembers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TeamId",
                table: "Meetings",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Teams",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkspaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Teams", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_TeamId",
                table: "Meetings",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkspaceMembers_TeamId",
                table: "WorkspaceMembers",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_Teams_WorkspaceId",
                table: "Teams",
                column: "WorkspaceId");

            migrationBuilder.CreateIndex(
                name: "IX_Teams_WorkspaceId_Name",
                table: "Teams",
                columns: new[] { "WorkspaceId", "Name" },
                unique: true);

            // Backfill: create a default team per workspace and assign existing members/meetings.
            // Requires pgcrypto (gen_random_uuid) which is already used elsewhere; if unavailable, replace with uuid_generate_v4().
            migrationBuilder.Sql(@"
WITH ws AS (
  SELECT ""Id"" AS workspace_id FROM ""Workspaces""
)
INSERT INTO ""Teams"" (""Id"", ""WorkspaceId"", ""Name"", ""CreatedAtUtc"", ""UpdatedAtUtc"")
SELECT gen_random_uuid(), ws.workspace_id, 'General', NOW(), NOW()
FROM ws
WHERE NOT EXISTS (
  SELECT 1 FROM ""Teams"" t WHERE t.""WorkspaceId"" = ws.workspace_id AND t.""Name"" = 'General'
);

WITH gen AS (
  SELECT t.""Id"" AS team_id, t.""WorkspaceId"" AS workspace_id
  FROM ""Teams"" t
  WHERE t.""Name"" = 'General'
)
UPDATE ""WorkspaceMembers"" wm
SET ""TeamId"" = gen.team_id
FROM gen
WHERE wm.""WorkspaceId"" = gen.workspace_id AND wm.""TeamId"" IS NULL;

WITH gen AS (
  SELECT t.""Id"" AS team_id, t.""WorkspaceId"" AS workspace_id
  FROM ""Teams"" t
  WHERE t.""Name"" = 'General'
)
UPDATE ""Meetings"" m
SET ""TeamId"" = gen.team_id
FROM gen
WHERE m.""WorkspaceId"" = gen.workspace_id AND m.""TeamId"" IS NULL;
");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Teams");

            migrationBuilder.DropIndex(
                name: "IX_Meetings_TeamId",
                table: "Meetings");

            migrationBuilder.DropIndex(
                name: "IX_WorkspaceMembers_TeamId",
                table: "WorkspaceMembers");

            migrationBuilder.DropColumn(
                name: "TeamId",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "TeamId",
                table: "WorkspaceMembers");

        }
    }
}
