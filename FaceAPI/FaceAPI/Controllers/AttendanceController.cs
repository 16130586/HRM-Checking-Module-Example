using FaceAPI.DbContexts;
using FaceAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using Pgvector;
using Pgvector.EntityFrameworkCore;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace FaceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        private static InferenceSession _w600OnnxSession;

        private PgDbContext _db { get; set; }
        private ILogger<AttendanceController> _logger { get; set; }

        public AttendanceController(PgDbContext db, ILogger<AttendanceController> logger)
        {
            _db = db;
            _logger = logger;

            if (_w600OnnxSession == null)
            {
                var modelPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "MLModels", "w600k_r50.onnx");
                _w600OnnxSession = new InferenceSession(modelPath);
            }
        }

        public record RegisterRequest(List<string>? Base64Images, string? Base64Image = null);

        public record CheckInRequest(string Base64Image);

        [HttpPost("register/{userId}")]
        public async Task<IActionResult> Register([FromRoute] int userId, [FromBody] RegisterRequest request)
        {
            var images = request.Base64Images;
            if (images == null && !string.IsNullOrWhiteSpace(request.Base64Image))
                images = [request.Base64Image];

            if (images == null || images.Count != 5)
                return BadRequest("Cần đăng ký đủ 5 góc khuôn mặt");

            if (images.Any(string.IsNullOrWhiteSpace))
                return BadRequest("Ảnh không hợp lệ");

            var user = await _db.Users
                .FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null)
                return NotFound("Không tìm thấy nhân viên");

            var vectors = new List<Vector>();
            foreach (var image in images)
            {
                var vectorArray = ExtractFaceVector(image);
                if (vectorArray == null)
                    return BadRequest("Không trích xuất được khuôn mặt từ ảnh");

                vectors.Add(new Vector(vectorArray));
            }

            var existingEmbeddings = await _db.FaceEmbeddings
                .Where(x => x.UserId == user.Id)
                .ToListAsync();
            _db.FaceEmbeddings.RemoveRange(existingEmbeddings);
            _db.FaceEmbeddings.AddRange(vectors.Select(vector => new FaceEmbedding
            {
                UserId = user.Id,
                Embedding = vector
            }));

            await _db.SaveChangesAsync();

            return Ok(new
            {
                Message = "Đăng ký khuôn mặt thành công!",
                UserId = user.Id
            });
        }

        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request)
        {
            if (string.IsNullOrEmpty(request.Base64Image))
                return BadRequest("Ảnh không hợp lệ");

            var targetVector = ExtractFaceVector(request.Base64Image);
            _logger.LogInformation("VECTOR: " + string.Join(", ", targetVector));
            if (targetVector == null)
                return BadRequest("Không xử lý được khuôn mặt");

            var searchVector = new Vector(targetVector);

            // Query Cosine Distance cực nhanh qua pgvector
            var matches = await _db.FaceEmbeddings
             .Include(f => f.User)
             .Select(f => new
             {
                 User = f.User,
                 Distance = f.Embedding.CosineDistance(searchVector)
             })
             .OrderBy(x => x.Distance)
             .Take(5)
             .ToListAsync();

            foreach (var item in matches)
            {
                _logger.LogInformation(
                    "FACE MATCH | User={UserCode} | Distance={Distance}",
                    item.User!.UserCode,
                    item.Distance);
            }

            var match = matches.FirstOrDefault(x => x.Distance < 0.45);

            if (match == null)
                return NotFound("Không nhận diện được nhân viên!");

            return Ok(new
            {
                Message = "Chấm công thành công!",
                UserCode = match.User!.UserCode,
                FullName = match.User.FullName,
                Score = Math.Round((1 - match.Distance) * 100, 2)
            });
        }

        // Helper: Xử lý Tensor & Run ArcFace ONNX
        private float[]? ExtractFaceVector(string base64Image)
        {
            try
            {
                var cleanBase64 = base64Image
                    .Replace("data:image/jpeg;base64,", "")
                    .Replace("data:image/png;base64,", "");
                var bytes = Convert.FromBase64String(cleanBase64);

                using var image = Image.Load<Rgb24>(bytes);
                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(112, 112),
                    Mode = ResizeMode.Pad // Giữ nguyên mặt, không bị kéo giãn làm méo dạng
                }));

                // Khai báo mảng 1D đại diện cho Tensor [1, 3, 112, 112]
                // Kích thước = 1 * 3 * 112 * 112 = 40,320 phần tử
                float[] inputData = new float[1 * 3 * 112 * 112];

                int channelSize = 112 * 112; // Kích thước 1 kênh màu (12,544)

                float[] mean = [0.485f, 0.456f, 0.406f];
                float[] std = [0.229f, 0.224f, 0.225f];

                for (int y = 0; y < 112; y++)
                {
                    for (int x = 0; x < 112; x++)
                    {
                        var pixel = image[x, y];
                        int index = y * 112 + x;

                        float r = (pixel.R / 255.0f - mean[0]) / std[0];
                        float g = (pixel.G / 255.0f - mean[1]) / std[1];
                        float b = (pixel.B / 255.0f - mean[2]) / std[2];

                        inputData[0 * channelSize + index] = (pixel.R - 127.5f) / 128.0f; // Channel R
                        inputData[1 * channelSize + index] = (pixel.G - 127.5f) / 128.0f; // Channel G
                        inputData[2 * channelSize + index] = (pixel.B - 127.5f) / 128.0f; // Channel B
                    }
                }

                // Tạo DenseTensor từ mảng 1D chuẩn layout
                DenseTensor<float> inputTensor = new(inputData, [1, 3, 112, 112]);

                var inputName = _w600OnnxSession.InputMetadata.Keys.First();
                List<NamedOnnxValue> inputs =
                [
                      NamedOnnxValue.CreateFromTensor(inputName, inputTensor)
                ];

                var inputValues = inputTensor.ToArray();

                using var results = _w600OnnxSession.Run(inputs);

                var outputTensor = results[0].AsEnumerable<float>().ToArray();

                _logger.LogInformation("RAW VECTOR SAMPLE: {V1}, {V2}, {V3}, {V4}, {V5}",
            outputTensor[0], outputTensor[1], outputTensor[2], outputTensor[3], outputTensor[4]);

                // Chuẩn hóa L2 Vector chuẩn
                double sumSquare = 0;
                for (int i = 0; i < outputTensor.Length; i++)
                {
                    sumSquare += outputTensor[i] * outputTensor[i];
                }

                float norm = (float)Math.Sqrt(sumSquare);
                if (norm > 0)
                {
                    for (int i = 0; i < outputTensor.Length; i++)
                    {
                        outputTensor[i] /= norm;
                    }
                }

                return outputTensor;
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"Error Extracting Vector: {ex.Message}");
                return null;
            }
        }
    }
}
