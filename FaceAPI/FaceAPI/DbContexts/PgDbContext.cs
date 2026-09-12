using FaceAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FaceAPI.DbContexts
{
    public class PgDbContext(DbContextOptions options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<FaceEmbedding> FaceEmbeddings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasPostgresExtension("vector");

            modelBuilder.Entity<FaceEmbedding>()
                  .HasIndex(e => e.Embedding)
                  .HasMethod("hnsw")
                  .HasOperators("vector_cosine_ops");
        }
    }
}
