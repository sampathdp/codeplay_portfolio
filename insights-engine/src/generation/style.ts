/**
 * Deterministic style guardrails applied after generation — cheap checks
 * that don't need a model call. They feed the quality gate and can force
 * NEEDS_REVIEW.
 */

export const DEFAULT_BANNED_PHRASES = [
  "game changer",
  "game-changer",
  "revolutionary",
  "in today's fast-paced world",
  "delve",
  "ever-evolving landscape",
  "ever-changing landscape",
  "seismic shift",
  "paradigm shift",
  "it goes without saying",
  "needless to say",
  "buckle up",
  "look no further",
  "in the world of",
  "when it comes to",
];

/** Phrases that falsely claim hands-on experience CodePlay does not have. */
export const DEFAULT_FORBIDDEN_CLAIMS = [
  "we tested",
  "we used",
  "we tried",
  "our developers found",
  "our team tested",
  "in our testing",
  "we benchmarked",
  "when we ran",
  "we've been using",
  "we ran it",
];

const SENSATIONAL_RE = /\b(shocking|insane|mind-?blowing|destroy\w*|obliterat\w+|will change everything|you won't believe|jaw-?dropping|bombshell|explosive|slams?|crushes?)\b/gi;
const HYPE_PUNCT_RE = /[!?]{2,}|[A-Z]{5,}/g;

export interface StyleFinding {
  kind: "banned_phrase" | "forbidden_claim" | "sensational" | "hype_punctuation";
  match: string;
}

export interface StyleReport {
  findings: StyleFinding[];
  bannedPhraseCount: number;
  forbiddenClaimCount: number;
  sensationalCount: number;
  /** 0-100, higher = more sensational. */
  sensationalismScore: number;
  ok: boolean;
}

export function checkStyle(
  text: string,
  opts: { bannedPhrases?: string[]; forbiddenClaims?: string[] } = {},
): StyleReport {
  const hay = ` ${text.toLowerCase()} `;
  const findings: StyleFinding[] = [];

  for (const phrase of opts.bannedPhrases ?? DEFAULT_BANNED_PHRASES) {
    if (hay.includes(` ${phrase.toLowerCase()} `) || hay.includes(phrase.toLowerCase())) {
      findings.push({ kind: "banned_phrase", match: phrase });
    }
  }
  for (const claim of opts.forbiddenClaims ?? DEFAULT_FORBIDDEN_CLAIMS) {
    if (hay.includes(claim.toLowerCase())) {
      findings.push({ kind: "forbidden_claim", match: claim });
    }
  }
  for (const m of text.matchAll(SENSATIONAL_RE)) {
    findings.push({ kind: "sensational", match: m[0] });
  }
  for (const m of text.matchAll(HYPE_PUNCT_RE)) {
    findings.push({ kind: "hype_punctuation", match: m[0] });
  }

  const bannedPhraseCount = findings.filter((f) => f.kind === "banned_phrase").length;
  const forbiddenClaimCount = findings.filter((f) => f.kind === "forbidden_claim").length;
  const sensationalCount = findings.filter(
    (f) => f.kind === "sensational" || f.kind === "hype_punctuation",
  ).length;

  const words = Math.max(1, text.trim().split(/\s+/).length);
  const per1k = (n: number) => (n / words) * 1000;
  const sensationalismScore = Math.min(
    100,
    Math.round(per1k(sensationalCount) * 22 + per1k(bannedPhraseCount) * 8),
  );

  return {
    findings,
    bannedPhraseCount,
    forbiddenClaimCount,
    sensationalCount,
    sensationalismScore,
    ok: forbiddenClaimCount === 0 && bannedPhraseCount <= 1 && sensationalCount === 0,
  };
}

/** Flesch reading ease → 0-100 readability proxy (clamped). */
export function readabilityScore(text: string): number {
  const sentences = Math.max(1, (text.match(/[.!?]+/g) ?? []).length);
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = Math.max(1, words.length);
  const syllables = words.reduce((n, w) => n + countSyllables(w), 0);
  const flesch =
    206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / wordCount);
  // Map Flesch (roughly -30..100) to 0..100, favouring 45-70 ("plain English").
  return Math.max(0, Math.min(100, Math.round(flesch)));
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  const groups = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "")
    .match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
