using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FaceAPI.Models
{
    public class AttendanceHistory
    {
        [Key]
        public long Id { get; set; }

        public int UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; } = null!;

        public string UserCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public DateTime CheckedInAtUtc { get; set; } = DateTime.UtcNow;
        public string? IpAddress { get; set; }
        public string? IpAddressV4 { get; set; }
        public string? IpAddressV6 { get; set; }
        public string? UserAgent { get; set; }
    }
}