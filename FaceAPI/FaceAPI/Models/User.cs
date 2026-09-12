using System.ComponentModel.DataAnnotations;

namespace FaceAPI.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string UserCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
