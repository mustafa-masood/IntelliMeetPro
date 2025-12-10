using Microsoft.AspNetCore.Http;

namespace IntelliMeet.Backend.Models
{
    public class AnalyzeRequest
    {
        public IFormFile File { get; set; } = default!;
    }
}
