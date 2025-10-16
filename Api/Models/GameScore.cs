using System.ComponentModel.DataAnnotations;

namespace Api.Models
{
    public class GameScore
    {
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string GameType { get; set; } = string.Empty;

        public int Score { get; set; }

        public int TotalQuestions { get; set; }

        public double Percentage => TotalQuestions > 0 ? (double)Score / TotalQuestions * 100 : 0;

        public DateTime DatePlayed { get; set; } = DateTime.UtcNow;

        public ApplicationUser User { get; set; } = null!;
    }
}
