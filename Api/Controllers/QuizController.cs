using Api.Data;
using Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    public class QuizController(ILogger<QuizController> logger, AppDbContext context) : Controller
    {
        private readonly ILogger<QuizController> _logger = logger;
        private readonly AppDbContext _context = context;

        private async Task<double?> GetUserRecentAverageAsync(int take = 10)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return null;

            var recent = await _context.GameScores
                .Where(gs => gs.UserId == userId)
                .OrderByDescending(gs => gs.DatePlayed)
                .Take(take)
                .Select(gs => gs.TotalQuestions > 0 ? (double)gs.Score / gs.TotalQuestions * 100 : 0)
                .ToListAsync();

            if (!recent.Any()) return null;
            return recent.Average();
        }

        private async Task<int> GetAdaptiveMaxLengthAsync(int @default, int min = 40, int max = 160)
        {
            var avg = await GetUserRecentAverageAsync();
            if (avg is null) return @default;

            int result = @default;
            if (avg < 50) result = Math.Max(min, @default - 40);
            else if (avg < 70) result = Math.Max(min, @default - 20);
            else if (avg > 85) result = Math.Min(max, @default + 20);

            return result;
        }

        [HttpGet("question")]
        public async Task<ActionResult<QuizQuestionDto>> GetQuestion()
        {
            var maxLength = await GetAdaptiveMaxLengthAsync(120);

            var total = await _context.SentencePairs
                .Where(p => p.English.Length < maxLength && p.Faroese.Length < maxLength)
                .CountAsync();

            if (total < 10)
                return BadRequest("Not enough valid phrases.");

            var rnd = new Random();

            var correctOffset = rnd.Next(total);
            var correct = await _context.SentencePairs
                .Where(p => p.English.Length < maxLength && p.Faroese.Length < maxLength)
                .Skip(correctOffset)
                .Take(1)
                .FirstOrDefaultAsync();

            if (correct == null) return NotFound("Random phrase not found.");

            var potentialWrong = await _context.SentencePairs
                .Where(p => p.Faroese != correct.Faroese &&
                            p.English.Length < maxLength &&
                            p.Faroese.Length < maxLength &&
                            Math.Abs(p.Faroese.Length - correct.Faroese.Length) <= 5)
                .Select(p => p.Faroese)
                .Distinct()
                .Take(50)
                .ToListAsync();

            var wrongOptions = potentialWrong
                .Where(w => w != correct.Faroese)
                .OrderBy(_ => rnd.Next())
                .Take(2)
                .ToList();

            if (wrongOptions.Count < 2)
                return BadRequest("Not enough wrong options.");

            var allOptions = wrongOptions
                .Append(correct.Faroese)
                .OrderBy(_ => rnd.Next())
                .ToList();

            return Ok(new QuizQuestionDto
            {
                En = correct.English,
                Fo = correct.Faroese,
                Options = allOptions
            });
        }

        [HttpGet("word-game")]
        public async Task<ActionResult<WordGameQuestionDto>> GetWordGameQuestion()
        {
            var maxLength = await GetAdaptiveMaxLengthAsync(120);

            var total = await _context.SentencePairs
                .Where(p => p.English.Length < maxLength && p.Faroese.Length < maxLength)
                .CountAsync();

            if (total == 0)
                return BadRequest("No sentences available.");

            var rnd = new Random();
            var offset = rnd.Next(total);

            var sentence = await _context.SentencePairs
                .Where(p => p.English.Length < maxLength && p.Faroese.Length < maxLength)
                .Skip(offset)
                .Take(1)
                .FirstOrDefaultAsync();

            if (sentence == null)
                return NotFound();

            var foWords = sentence.Faroese.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToList();
            var shuffled = foWords.OrderBy(_ => rnd.Next()).ToList();

            return Ok(new WordGameQuestionDto
            {
                En = sentence.English,
                FoWords = foWords,
                ShuffledWords = shuffled
            });
        }

        [HttpGet("translation-game")]
        public async Task<ActionResult<TranslationGameQuestionDto>> GetTranslationGameQuestion()
        {
            var maxLength = await GetAdaptiveMaxLengthAsync(80);

            var total = await _context.SentencePairs
                .Where(p => p.English.Length < maxLength && 
                           p.Faroese.Length < maxLength &&
                           !p.English.Contains("?") && 
                           !p.Faroese.Contains("?"))
                .CountAsync();

            if (total == 0)
                return BadRequest("No suitable sentences available for translation.");

            var rnd = new Random();
            var offset = rnd.Next(total);

            var sentence = await _context.SentencePairs
                .Where(p => p.English.Length < maxLength && 
                           p.Faroese.Length < maxLength &&
                           !p.English.Contains("?") && 
                           !p.Faroese.Contains("?"))
                .Skip(offset)
                .Take(1)
                .FirstOrDefaultAsync();

            if (sentence == null)
                return NotFound();

            var hints = sentence.Faroese
                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Select(word => word.Substring(0, 1).ToUpper() + new string('_', Math.Max(0, word.Length - 1)))
                .ToList();

            return Ok(new TranslationGameQuestionDto
            {
                En = sentence.English,
                CorrectAnswer = sentence.Faroese,
                Hints = hints
            });
        }

    }
}