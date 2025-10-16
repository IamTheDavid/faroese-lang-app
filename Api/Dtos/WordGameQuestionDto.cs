public class WordGameQuestionDto
{
    public string En { get; set; } = string.Empty;
    public List<string> FoWords { get; set; } = new();
    public List<string> ShuffledWords { get; set; } = new();
}
