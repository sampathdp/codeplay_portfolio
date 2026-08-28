/**
 * Score helpers for CodePlay Insights.
 *
 * Phase 2 provides the maths only — the ranking pipeline that feeds real
 * signals into these is Phase 3. All scores are on a 0–100 scale.
 */

export const SCORE_MIN = 0;
export const SCORE_MAX = 100;

export function clampScore(value: number): number {
  if (Number.isNaN(value)) return SCORE_MIN;
  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, value));
}

export interface CandidateSignals {
  engagement: number;
  freshness: number;
  authority: number;
  relevance: number;
  community: number;
  novelty: number;
}

/**
 * Default weighting for the composite virality score of a news candidate.
 * Tunable per deployment; kept here so the pipeline and any admin preview
 * agree.
 */
export const DEFAULT_VIRAL_WEIGHTS: Readonly<Record<keyof CandidateSignals, number>> = {
  engagement: 0.3,
  freshness: 0.2,
  authority: 0.15,
  relevance: 0.2,
  community: 0.1,
  novelty: 0.05,
};

export function compositeViralScore(
  signals: CandidateSignals,
  weights: Partial<Record<keyof CandidateSignals, number>> = {},
): number {
  const w = { ...DEFAULT_VIRAL_WEIGHTS, ...weights };
  const keys = Object.keys(DEFAULT_VIRAL_WEIGHTS) as (keyof CandidateSignals)[];

  const totalWeight = keys.reduce((sum, k) => sum + (w[k] ?? 0), 0);
  if (totalWeight <= 0) return SCORE_MIN;

  const weighted = keys.reduce(
    (sum, k) => sum + clampScore(signals[k] ?? 0) * (w[k] ?? 0),
    0,
  );
  return clampScore(weighted / totalWeight);
}

export interface QualitySubscores {
  factCheck: number;
  sourceQuality: number;
  originality: number;
  readability: number;
  seo: number;
}

export const DEFAULT_QUALITY_WEIGHTS: Readonly<Record<keyof QualitySubscores, number>> = {
  factCheck: 0.3,
  sourceQuality: 0.2,
  originality: 0.25,
  readability: 0.15,
  seo: 0.1,
};

export function overallQualityScore(
  scores: QualitySubscores,
  weights: Partial<Record<keyof QualitySubscores, number>> = {},
): number {
  const w = { ...DEFAULT_QUALITY_WEIGHTS, ...weights };
  const keys = Object.keys(DEFAULT_QUALITY_WEIGHTS) as (keyof QualitySubscores)[];

  const totalWeight = keys.reduce((sum, k) => sum + (w[k] ?? 0), 0);
  if (totalWeight <= 0) return SCORE_MIN;

  const weighted = keys.reduce(
    (sum, k) => sum + clampScore(scores[k] ?? 0) * (w[k] ?? 0),
    0,
  );
  return clampScore(weighted / totalWeight);
}
