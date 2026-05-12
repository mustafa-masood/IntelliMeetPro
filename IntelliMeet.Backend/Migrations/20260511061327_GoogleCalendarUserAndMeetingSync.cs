using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IntelliMeet.Backend.Migrations
{
    /// <inheritdoc />
    public partial class GoogleCalendarUserAndMeetingSync : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CalendarConnected",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CalendarLastSyncAtUtc",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoogleAccessToken",
                table: "Users",
                type: "character varying(8192)",
                maxLength: 8192,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoogleRefreshToken",
                table: "Users",
                type: "character varying(8192)",
                maxLength: 8192,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "GoogleTokenExpiryUtc",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "BotScheduleEnabled",
                table: "Meetings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "BotScheduledAtUtc",
                table: "Meetings",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CalendarBotExternalId",
                table: "Meetings",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoogleCalendarEventId",
                table: "Meetings",
                type: "character varying(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoogleCalendarHtmlLink",
                table: "Meetings",
                type: "character varying(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCancelledFromCalendar",
                table: "Meetings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsFromCalendar",
                table: "Meetings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_OrganizerUserId_GoogleCalendarEventId",
                table: "Meetings",
                columns: new[] { "OrganizerUserId", "GoogleCalendarEventId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Meetings_OrganizerUserId_GoogleCalendarEventId",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "CalendarConnected",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CalendarLastSyncAtUtc",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "GoogleAccessToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "GoogleRefreshToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "GoogleTokenExpiryUtc",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BotScheduleEnabled",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "BotScheduledAtUtc",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "CalendarBotExternalId",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "GoogleCalendarEventId",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "GoogleCalendarHtmlLink",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "IsCancelledFromCalendar",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "IsFromCalendar",
                table: "Meetings");
        }
    }
}
