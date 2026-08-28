/**
 * Database row shapes for CodePlay Insights (snake_case, mirroring the
 * Supabase schema in `supabase/migrations/`). These are the raw records
 * returned by `@supabase/supabase-js`; the camelCase view models in
 * `types.ts` are what the UI consumes.
 */

export type ArticleStatusRow =
  | "idea"
  | "researching"
  | "draft"
  | "review"
  | "scheduled"
  | "published"
  | "rejected"
  | "archived";

export type ContentTypeRow =
  | "news"
  | "analysis"
  | "explainer"
  | "opinion"
  | "roundup"
  | "tutorial";

export type SourceKindRow =
  | "official"
  | "rss"
  | "api"
  | "community"
  | "release_feed";

export type CandidateStatusRow =
  | "discovered"
  | "filtered"
  | "selected"
  | "rejected"
  | "converted"
  | "ignored";

export type FactConfidenceRow =
  | "verified"
  | "likely"
  | "community_rumor"
  | "unverified";

export type JobStatusRow =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  seo_title: string;
  seo_description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AuthorRow {
  id: string;
  name: string;
  slug: string;
  bio: string;
  avatar_url: string | null;
  role: string;
  expertise: string[];
  social_links: Record<string, string>;
  is_team: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TagRow {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string;
  content: string;
  content_html: string | null;
  content_format: "markdown" | "mdx" | "html";
  category_id: string;
  author_id: string;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  image_prompt: string | null;
  image_is_ai_generated: boolean;
  featured_image_status: "none" | "generated" | "manual" | "fallback" | "failed";
  featured_image_is_manual: boolean;
  featured_image_model: string | null;
  featured_image_generated_at: string | null;
  featured_image_width: number | null;
  featured_image_height: number | null;
  featured_image_bytes: number | null;
  featured_image_storage_path: string | null;
  featured_image_variants: Array<{
    label: string;
    url: string;
    width: number;
    height: number;
    bytes: number;
  }>;
  status: ArticleStatusRow;
  content_type: ContentTypeRow;
  featured: boolean;
  trending: boolean;
  breaking: boolean;
  source_count: number;
  quality_score: number | null;
  viral_score: number | null;
  seo_score: number | null;
  reading_time: number;
  view_count: number;
  share_count: number;
  developer_take: string | null;
  business_impact: string | null;
  developer_impact: string | null;
  risks_limitations: string | null;
  why_it_matters: string | null;
  recommendations: string | null;
  candidate_id: string | null;
  cluster_id: string | null;
  published_at: string | null;
  scheduled_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;

  // Phase 4 — generation metadata
  article_type: string | null;
  headline_options: string[];
  sections: Array<{ key: string; heading: string; content: string }>;
  fact_check: Record<string, unknown> | null;
  needs_review: boolean;
  review_reasons: string[];
  generation_job_id: string | null;
  human_edited_sections: string[];
  approved_at: string | null;
  approved_by: string | null;

  // SEO columns
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
}

export interface ArticleSourceRow {
  id: string;
  article_id: string;
  source_name: string;
  source_url: string;
  source_type: string;
  source_author: string | null;
  source_published_at: string | null;
  primary_source: boolean;
  verified: boolean;
  notes: string | null;
  created_at: string;
}

export interface ArticleQualityRow {
  article_id: string;
  fact_check_score: number | null;
  source_quality_score: number | null;
  originality_score: number | null;
  readability_score: number | null;
  seo_score: number | null;
  overall_quality_score: number | null;
  checks: Record<string, unknown>;
  checked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsSourceRow {
  id: string;
  name: string;
  slug: string | null;
  adapter: string | null;
  base_url: string;
  feed_url: string | null;
  source_type: SourceKindRow;
  category: string | null;
  enabled: boolean;
  trust_score: number;
  priority: number;
  last_checked_at: string | null;
  run_requested_at: string | null;
  configuration: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface NewsCandidateRow {
  id: string;
  external_id: string | null;
  title: string;
  url: string;
  source: string;
  source_type: SourceKindRow | null;
  news_source_id: string | null;
  summary: string;
  category: string | null;
  published_at: string | null;
  discovered_at: string;
  engagement_score: number;
  freshness_score: number;
  authority_score: number;
  relevance_score: number;
  community_score: number;
  novelty_score: number;
  viral_score: number;
  duplicate_group_id: string | null;
  cluster_id: string | null;
  adapter: string | null;
  normalized_title: string | null;
  normalized_url: string | null;
  dedupe_hash: string | null;
  themes: string[];
  entities: string[];
  keywords: string[];
  fact_confidence: FactConfidenceRow;
  raw: Record<string, unknown>;
  status: CandidateStatusRow;
  rejection_reason: string | null;
  article_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentGenerationJobRow {
  id: string;
  candidate_id: string | null;
  article_id: string | null;
  status: JobStatusRow;
  step: "research" | "draft" | "image" | "quality" | "finalize";
  model: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  cost_usd: number | null;
  error: string | null;
  attempt_count: number;
  max_attempts: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminActionLogRow {
  id: number;
  actor: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AdminRow {
  user_id: string;
  email: string | null;
  role: "editor" | "admin";
  created_at: string;
}

// --- Phase 3: discovery / trending engine --------------------------------

export interface SettingRow {
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
}

export interface TopicClusterRow {
  id: string;
  cluster_key: string;
  title: string;
  normalized_title: string;
  slug: string | null;
  summary: string;
  primary_theme: string | null;
  themes: string[];
  category: string | null;
  freshness_score: number;
  engagement_score: number;
  authority_score: number;
  cross_source_score: number;
  relevance_score: number;
  community_score: number;
  novelty_score: number;
  viral_score: number;
  source_count: number;
  breaking: boolean;
  fact_confidence: FactConfidenceRow;
  entities: string[];
  keywords: string[];
  status: CandidateStatusRow;
  selection_reason: string | null;
  rejection_reason: string | null;
  research_forced: boolean;
  first_seen_at: string;
  last_seen_at: string;
  earliest_published_at: string | null;
  article_id: string | null;
  created_at: string;
  updated_at: string;
}

export type GenerationJobKind =
  | "full_article"
  | "regenerate_section"
  | "improve_title"
  | "improve_seo"
  | "regenerate_summary"
  | "fact_check"
  | "generate_image"
  | "regenerate_image";

export interface GenerationJobRow {
  id: string;
  kind: GenerationJobKind;
  cluster_id: string | null;
  article_id: string | null;
  article_type: string | null;
  status: JobStatusRow;
  step: string;
  params: Record<string, unknown>;
  bundle: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  needs_review: boolean;
  review_reason: string | null;
  model: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  cost_usd: number | null;
  error: string | null;
  attempt_count: number;
  requested_by: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImageAssetRow {
  id: string;
  article_id: string;
  job_id: string | null;
  label: string;
  url: string;
  storage_path: string | null;
  content_type: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  is_primary: boolean;
  source: "generated" | "manual" | "fallback";
  model: string | null;
  prompt: string | null;
  alt_text: string | null;
  created_at: string;
}

export interface AiUsageRow {
  id: number;
  job_id: string | null;
  cluster_id: string | null;
  step: string;
  provider: string;
  model: string;
  request_count: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
  status: "ok" | "error" | "blocked";
  error: string | null;
  created_at: string;
}

export interface IngestionRunRow {
  id: string;
  adapter: string;
  source_id: string | null;
  source_slug: string | null;
  status: "running" | "succeeded" | "failed" | "skipped";
  items_found: number;
  items_new: number;
  items_updated: number;
  clusters_touched: number;
  error: string | null;
  meta: Record<string, unknown>;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
}
