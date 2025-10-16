using System.Text.RegularExpressions;
using Api.Models;

namespace Api.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (context.SentencePairs.Any()) return;

            var url = "https://raw.githubusercontent.com/Sprotin/translations/main/sentences_en-fo.strict.csv";
            string csvData;

            using (var client = new HttpClient())
            {
                csvData = await client.GetStringAsync(url);
            }

            var lines = csvData.Split('\n');
            var regex = new Regex("^\"(.*)\",\"(.*)\"$");

            var sentencePairs = new List<SentencePair>();
            var seen = new HashSet<string>();

            foreach (var line in lines)
            {
                if (string.IsNullOrWhiteSpace(line)) continue;

                var match = regex.Match(line.Trim());
                if (!match.Success) continue;

                var english = match.Groups[1].Value.Replace("\"\"", "\"").Trim();
                var faroese = match.Groups[2].Value.Replace("\"\"", "\"").Trim();

                if (string.IsNullOrWhiteSpace(english) || string.IsNullOrWhiteSpace(faroese)) continue;
                if (english.Length < 5 || faroese.Length < 5) continue;
                if (english.Contains("http") || faroese.Contains("http")) continue;
                if (english.Count(c => c == '"') > 2 || faroese.Count(c => c == '"') > 2) continue;

                var maxWords = 12;
                if (english.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length > maxWords) continue;
                if (faroese.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length > maxWords) continue;

                var key = $"{english}|{faroese}";
                if (seen.Contains(key)) continue;
                seen.Add(key);

                sentencePairs.Add(new SentencePair { English = english, Faroese = faroese });
            }

            Console.WriteLine($"✅ Seeded {sentencePairs.Count} sentence pairs.");
            context.SentencePairs.AddRange(sentencePairs);
            await context.SaveChangesAsync();
        }
    }
}
