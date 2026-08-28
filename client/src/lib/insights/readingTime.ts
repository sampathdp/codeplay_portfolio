/**
 * Reading-time estimate for CodePlay Insights articles.
 *
 * Mirrors the SQL trigger in migration 4 (~200 words/minute, minimum of
 * 1 minute for any non-empty content, 0 for empty).
 */

export const WORDS_PER_MINUTE = 200;

export function countWords(text: string): number {
  const trimmed = (text ?? "").trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

export function estimateReadingTime(
  text: string,
  wordsPerMinute = WORDS_PER_MINUTE,
): number {
  const words = countWords(text);
  if (words === 0) return 0;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
