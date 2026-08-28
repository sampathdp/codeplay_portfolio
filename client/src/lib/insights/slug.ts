/**
 * SEO slug generation for CodePlay Insights.
 *
 * Mirrors the SQL `insights_slugify` / `insights_article_unique_slug`
 * functions (see migration 4) so the admin panel can show a live preview
 * that matches what the database will store. The database remains the
 * source of truth for uniqueness.
 */

const MAX_SLUG_LENGTH = 80;

// Common Latin-1 / extended letters → ASCII, matching the SQL translate().
const CHAR_MAP: Record<string, string> = {};
const FROM = "àáâãäåāăąèéêëēĕėęěìíîïĩīĭįòóôõöøōŏőùúûüũūŭůűųñçćčđšžýÿ";
const TO = "aaaaaaaaaeeeeeeeeeiiiiiiiiooooooooouuuuuuuuunccccszyy";
for (let i = 0; i < FROM.length; i++) CHAR_MAP[FROM[i]] = TO[i];

export function slugify(input: string): string {
  const lowered = (input ?? "").toLowerCase();
  let out = "";
  for (const ch of lowered) out += CHAR_MAP[ch] ?? ch;

  return out
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip remaining combining marks
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Produce a slug from `desired` (or `fallbackFrom`, typically the title)
 * that is not already present in `existing`. Appends `-2`, `-3`, … on
 * collision — never `-1`.
 */
export function ensureUniqueSlug(
  desired: string,
  existing: Iterable<string>,
  fallbackFrom = "",
): string {
  const taken = new Set(existing);

  let base = slugify(desired) || slugify(fallbackFrom) || "article";
  base = base.slice(0, MAX_SLUG_LENGTH).replace(/^-+|-+$/g, "");
  if (!base) base = "article";

  if (!taken.has(base)) return base;

  let n = 1;
  let candidate = base;
  while (taken.has(candidate)) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
}

export { MAX_SLUG_LENGTH };
