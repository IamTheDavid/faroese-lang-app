namespace Api.Dtos
{
    public class ScoreSubmissionDto
    {
        public string GameType { get; set; } = string.Empty;
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
    }

    public class GameScoreDto
    {
        public int Id { get; set; }
        public string GameType { get; set; } = string.Empty;
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public double Percentage { get; set; }
        public DateTime DatePlayed { get; set; }
        public string Username { get; set; } = string.Empty;
    }

    public class UserStatsDto
    {
        public int TotalGamesPlayed { get; set; }
        public double AverageScore { get; set; }
        public double BestScore { get; set; }
        public string FavoriteGameType { get; set; } = string.Empty;
        public int TotalCorrectAnswers { get; set; }
        public int TotalQuestions { get; set; }
    }
}
