namespace Api.Models
{
    public class SentencePair
    {
        public int Id { get; set; }
        public string English { get; set; } = string.Empty;
        public string Faroese { get; set; } = string.Empty;
    }
}