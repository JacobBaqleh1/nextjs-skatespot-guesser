export function calculateScore(distanceMiles: number): number {
  // Score system: Max 5000 points, decreases with distance
  // Perfect guess (0 miles) = 5000 points
  // 1 mile = ~4800 points
  // 10 miles = ~4000 points
  // 100 miles = ~1000 points
  // 1000+ miles = 0 points

  const maxScore = 5000;
  const decayRate = 0.01; // Adjust this to make scoring more/less forgiving

  const score = Math.max(
    0,
    Math.round(maxScore * Math.exp(-decayRate * distanceMiles)),
  );
  return score;
}

export function getScoreRating(score: number): string {
  if (score >= 4500) return "🏆 Perfect!";
  if (score >= 4000) return "⭐ Excellent!";
  if (score >= 3000) return "👍 Great!";
  if (score >= 2000) return "👌 Good!";
  if (score >= 1000) return "🤔 Not bad!";
  return "😅 Better luck tomorrow!";
}
