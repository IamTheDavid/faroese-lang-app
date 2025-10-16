using Api.Data;
using Api.Dtos;
using Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ScoresController(ILogger<ScoresController> logger, AppDbContext context) : ControllerBase
    {
        private readonly ILogger<ScoresController> _logger = logger;
        private readonly AppDbContext _context = context;

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitScore([FromBody] ScoreSubmissionDto scoreData)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var gameScore = new GameScore
            {
                UserId = userId,
                GameType = scoreData.GameType,
                Score = scoreData.Score,
                TotalQuestions = scoreData.TotalQuestions,
                DatePlayed = DateTime.UtcNow
            };

            _context.GameScores.Add(gameScore);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Score submitted successfully", Id = gameScore.Id });
        }

        [HttpGet("user-stats")]
        public async Task<ActionResult<UserStatsDto>> GetUserStats()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var userScores = await _context.GameScores
                .Where(gs => gs.UserId == userId)
                .ToListAsync();

            if (!userScores.Any())
            {
                return Ok(new UserStatsDto
                {
                    TotalGamesPlayed = 0,
                    AverageScore = 0,
                    BestScore = 0,
                    FavoriteGameType = "",
                    TotalCorrectAnswers = 0,
                    TotalQuestions = 0
                });
            }

            var favoriteGameType = userScores
                .GroupBy(gs => gs.GameType)
                .OrderByDescending(g => g.Count())
                .First()
                .Key;

            var stats = new UserStatsDto
            {
                TotalGamesPlayed = userScores.Count,
                AverageScore = userScores.Average(gs => gs.Percentage),
                BestScore = userScores.Max(gs => gs.Percentage),
                FavoriteGameType = favoriteGameType,
                TotalCorrectAnswers = userScores.Sum(gs => gs.Score),
                TotalQuestions = userScores.Sum(gs => gs.TotalQuestions)
            };

            return Ok(stats);
        }

        [HttpGet("recent")]
        public async Task<ActionResult<List<GameScoreDto>>> GetRecentScores([FromQuery] int limit = 5)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var recentScores = await _context.GameScores
                .Where(gs => gs.UserId == userId)
                .Include(gs => gs.User)
                .OrderByDescending(gs => gs.DatePlayed)
                .Take(limit)
                .Select(gs => new GameScoreDto
                {
                    Id = gs.Id,
                    GameType = gs.GameType,
                    Score = gs.Score,
                    TotalQuestions = gs.TotalQuestions,
                    Percentage = gs.TotalQuestions > 0 ? (double)gs.Score / gs.TotalQuestions * 100 : 0,
                    DatePlayed = gs.DatePlayed,
                    Username = gs.User.UserName ?? ""
                })
                .ToListAsync();

            return Ok(recentScores);
        }

        [HttpGet("top")]
        public async Task<ActionResult<List<GameScoreDto>>> GetTopScores([FromQuery] int limit = 10)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var topScores = await _context.GameScores
                .Where(gs => gs.UserId == userId)
                .Include(gs => gs.User)
                .OrderByDescending(gs => gs.TotalQuestions > 0 ? (double)gs.Score / gs.TotalQuestions * 100 : 0)
                .ThenByDescending(gs => gs.DatePlayed)
                .Take(limit)
                .Select(gs => new GameScoreDto
                {
                    Id = gs.Id,
                    GameType = gs.GameType,
                    Score = gs.Score,
                    TotalQuestions = gs.TotalQuestions,
                    Percentage = gs.TotalQuestions > 0 ? (double)gs.Score / gs.TotalQuestions * 100 : 0,
                    DatePlayed = gs.DatePlayed,
                    Username = gs.User.UserName ?? ""
                })
                .ToListAsync();

            return Ok(topScores);
        }

        [HttpGet("user")]
        public async Task<ActionResult<List<GameScoreDto>>> GetAllUserScores()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var userScores = await _context.GameScores
                .Where(gs => gs.UserId == userId)
                .Include(gs => gs.User)
                .OrderByDescending(gs => gs.DatePlayed)
                .Select(gs => new GameScoreDto
                {
                    Id = gs.Id,
                    GameType = gs.GameType,
                    Score = gs.Score,
                    TotalQuestions = gs.TotalQuestions,
                    Percentage = gs.TotalQuestions > 0 ? (double)gs.Score / gs.TotalQuestions * 100 : 0,
                    DatePlayed = gs.DatePlayed,
                    Username = gs.User.UserName ?? ""
                })
                .ToListAsync();

            return Ok(userScores);
        }
    }
}
