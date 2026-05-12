using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IntelliMeet.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMeetingRagIndexedAtUtc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "RagIndexedAtUtc",
                table: "Meetings",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RagIndexedAtUtc",
                table: "Meetings");
        }
    }
}
