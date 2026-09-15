using FaceAPI.Controllers;
using FaceAPI.DbContexts;
using FaceAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using Xunit;

namespace FaceAPI.Tests;

public class UserControllerTests
{
    [Fact]
    public async Task CreateUser_rejects_missing_fields()
    {
        await using var db = CreateDbContext();
        var controller = new UserController(db);

        var result = await controller.CreateUser(new UserController.CreateUserRequest(" ", ""));

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Mã nhân viên và Họ tên không được để trống!", badRequest.Value);
        Assert.Empty(await db.Users.ToListAsync());
    }

    [Fact]
    public async Task CreateUser_trims_values_and_returns_created_user()
    {
        await using var db = CreateDbContext();
        var controller = new UserController(db);

        var result = await controller.CreateUser(new UserController.CreateUserRequest(" EMP-01 ", " Ada Lovelace "));

        var created = Assert.IsType<CreatedAtActionResult>(result);
        var user = Assert.Single(await db.Users.ToListAsync());
        Assert.Equal("EMP-01", user.UserCode);
        Assert.Equal("Ada Lovelace", user.FullName);
        Assert.Equal(nameof(UserController.GetUserById), created.ActionName);
    }

    [Fact]
    public async Task CreateUser_rejects_duplicate_user_codes()
    {
        await using var db = CreateDbContext();
        db.Users.Add(new User { UserCode = "EMP-01", FullName = "Existing" });
        await db.SaveChangesAsync();
        var controller = new UserController(db);

        var result = await controller.CreateUser(new UserController.CreateUserRequest("EMP-01", "Another"));

        var conflict = Assert.IsType<ConflictObjectResult>(result);
        Assert.Equal("Mã nhân viên 'EMP-01' đã tồn tại trong hệ thống!", conflict.Value);
        Assert.Single(await db.Users.ToListAsync());
    }

    [Fact]
    public async Task GetUserById_reports_face_registration_state()
    {
        await using var db = CreateDbContext();
        var user = new User { UserCode = "EMP-01", FullName = "Ada" };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        db.FaceEmbeddings.Add(new FaceEmbedding
        {
            UserId = user.Id,
            Embedding = new Pgvector.Vector(new[] { 1f, 0f })
        });
        await db.SaveChangesAsync();
        var controller = new UserController(db);

        var result = await controller.GetUserById(user.Id);

        var response = Assert.IsType<OkObjectResult>(result);
        var hasFaceRegistered = response.Value!.GetType().GetProperty("HasFaceRegistered");
        Assert.True((bool)hasFaceRegistered!.GetValue(response.Value)!);
    }

    private static PgDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<PgDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestPgDbContext(options);
    }

    private sealed class TestPgDbContext(DbContextOptions options) : PgDbContext(options)
    {
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<FaceEmbedding>().Ignore(embedding => embedding.Embedding);
        }
    }
}