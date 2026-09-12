using FaceAPI.DbContexts;
using FaceAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FaceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController(PgDbContext db) : ControllerBase
    {

        public record CreateUserRequest(string UserCode, string FullName);

        // 1. API Đăng ký / Tạo mới User (Chưa cần ảnh khuôn mặt)
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.UserCode) || string.IsNullOrWhiteSpace(request.FullName))
                return BadRequest("Mã nhân viên và Họ tên không được để trống!");

            // Kiểm tra trùng Mã Nhân Viên (UserCode)
            var isExist = await db.Users.AnyAsync(u => u.UserCode == request.UserCode);
            if (isExist)
                return Conflict($"Mã nhân viên '{request.UserCode}' đã tồn tại trong hệ thống!");

            var user = new User
            {
                UserCode = request.UserCode.Trim(),
                FullName = request.FullName.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, new
            {
                Message = "Tạo user thành công!",
                User = user
            });
        }

        // 2. API Lấy danh sách toàn bộ Users (Kèm thông tin xem đã đăng ký khuôn mặt chưa)
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await db.Users
                .Select(u => new
                {
                    u.Id,
                    u.UserCode,
                    u.FullName,
                    u.CreatedAt,
                    HasFaceRegistered = db.FaceEmbeddings.Any(f => f.UserId == u.Id)
                })
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            return Ok(users);
        }

        // 3. API Lấy thông tin chi tiết 1 User theo ID
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await db.Users.FindAsync(id);
            if (user == null)
                return NotFound("Không tìm thấy nhân viên!");

            var hasFace = await db.FaceEmbeddings.AnyAsync(f => f.UserId == id);

            return Ok(new
            {
                user.Id,
                user.UserCode,
                user.FullName,
                user.CreatedAt,
                HasFaceRegistered = hasFace
            });
        }

        // 4. API Xóa User
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await db.Users.FindAsync(id);
            if (user == null)
                return NotFound("Không tìm thấy nhân viên!");

            db.Users.Remove(user);
            await db.SaveChangesAsync(); // Do đã cài ON DELETE CASCADE nên Vector khuôn mặt liên quan cũng tự bị xóa

            return Ok(new { Message = $"Đã xóa thành công nhân viên {user.FullName} ({user.UserCode})" });
        }
    }
}
