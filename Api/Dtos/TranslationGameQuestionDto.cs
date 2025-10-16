namespace Api.Dtos
{
    public class TranslationGameQuestionDto
    {
        public string En { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public List<string> Hints { get; set; } = new();
    }
}
