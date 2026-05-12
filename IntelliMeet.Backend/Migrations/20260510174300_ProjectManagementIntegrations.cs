using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IntelliMeet.Backend.Migrations
{
    /// <inheritdoc />
    public partial class ProjectManagementIntegrations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExternalTaskUrl",
                table: "ActionItems",
                type: "character varying(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SyncedPlatform",
                table: "ActionItems",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProjectManagementIntegrations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Platform = table.Column<int>(type: "integer", nullable: false),
                    AccessToken = table.Column<string>(type: "character varying(8192)", maxLength: 8192, nullable: false),
                    RefreshToken = table.Column<string>(type: "character varying(8192)", maxLength: 8192, nullable: true),
                    ExpiresAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    ProjectId = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    BoardId = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    JiraCloudId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    SelectedTargetName = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectManagementIntegrations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectManagementIntegrations_UserId_Platform",
                table: "ProjectManagementIntegrations",
                columns: new[] { "UserId", "Platform" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectManagementIntegrations");

            migrationBuilder.DropColumn(
                name: "ExternalTaskUrl",
                table: "ActionItems");

            migrationBuilder.DropColumn(
                name: "SyncedPlatform",
                table: "ActionItems");
        }
    }
}
