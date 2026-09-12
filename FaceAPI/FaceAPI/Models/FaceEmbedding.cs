using Pgvector;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FaceAPI.Models
{
    public class FaceEmbedding
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        // Vector 512 chiều trích xuất từ ArcFace ResNet100
        [Column(TypeName = "vector(512)")]
        public Vector Embedding { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
