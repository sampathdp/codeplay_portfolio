/**
 * Zod validation schemas for CodePlay Insights admin input.
 *
 * These run client-side for fast feedback; the database (constraints +
 * RLS + RPC checks) is the real gate. Shared with tests.
 */

import { z } from "zod";
import { INSIGHTS_CATEGORY_SLUGS } from "./categories";

export const CONTENT_FORMATS = ["markdown", "mdx", "html"] as const;
export const CONTENT_TYPES = [
  "news",
  "analysis",
  "explainer",
  "opinion",
  "roundup",
  "tutorial",
] as const;

/** Statuses an admin may set directly when creating/editing (workflow
 * transitions like `published` / `scheduled` go through dedicated RPCs). */
export const EDITABLE_ARTICLE_STATUSES = [
  "idea",
  "researching",
  "draft",
  "review",
  "rejected",
  "archived",
] as const;

export const SOURCE_KINDS = [
  "official",
  "rss",
  "api",
  "community",
  "release_feed",
] as const;

export const ARTICLE_SOURCE_TYPES = [
  "article",
  "official_blog",
  "press_release",
  "documentation",
  "research_paper",
  "release_notes",
  "video",
  "forum",
  "social",
  "repo",
  "other",
] as const;

const uuid = z.string().uuid();
const optionalUrl = z.string().url().max(2048).optional();

export const articleSourceInputSchema = z.object({
  source_name: z.string().min(1).max(200),
  source_url: z.string().url().max(2048),
  source_type: z.enum(ARTICLE_SOURCE_TYPES).default("article"),
  source_author: z.string().max(200).optional(),
  source_published_at: z.string().datetime().optional(),
  primary_source: z.boolean().default(false),
  verified: z.boolean().default(false),
  // Short factual notes only — never a copied article body.
  notes: z.string().max(2000).optional(),
});

export const articleCreateSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z
    .string()
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase hyphenated slug")
    .optional(),
  subtitle: z.string().max(300).optional(),
  excerpt: z.string().max(600).default(""),
  content: z.string().default(""),
  content_format: z.enum(CONTENT_FORMATS).default("markdown"),
  content_type: z.enum(CONTENT_TYPES).default("news"),
  status: z.enum(EDITABLE_ARTICLE_STATUSES).default("draft"),
  category_id: uuid,
  author_id: uuid.optional(),
  candidate_id: uuid.optional(),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  breaking: z.boolean().default(false),
  featured_image_url: optionalUrl,
  featured_image_alt: z.string().max(300).optional(),
  image_prompt: z.string().max(2000).optional(),
  image_is_ai_generated: z.boolean().default(false),
  seo_title: z.string().max(120).optional(),
  seo_description: z.string().max(320).optional(),
  canonical_url: z.string().url().max(2048).optional(),
  developer_take: z.string().max(8000).optional(),
  business_impact: z.string().max(8000).optional(),
  developer_impact: z.string().max(8000).optional(),
  risks_limitations: z.string().max(8000).optional(),
  why_it_matters: z.string().max(8000).optional(),
  recommendations: z.string().max(8000).optional(),
  tag_ids: z.array(uuid).max(50).optional(),
  sources: z.array(articleSourceInputSchema).max(50).optional(),
});

export type ArticleCreateInput = z.infer<typeof articleCreateSchema>;

/** Every field optional; `id` required to target the row. */
export const articleUpdateSchema = articleCreateSchema
  .partial()
  .extend({ id: uuid });

export type ArticleUpdateInput = z.infer<typeof articleUpdateSchema>;

export const scheduleArticleSchema = z.object({
  id: uuid,
  scheduled_at: z
    .string()
    .datetime()
    .refine((v) => new Date(v).getTime() > Date.now(), {
      message: "scheduled_at must be in the future",
    }),
});

export const categoryInputSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().max(500).default(""),
  seo_title: z.string().max(120).default(""),
  seo_description: z.string().max(300).default(""),
  sort_order: z.number().int().min(0).default(0),
});

export const categorySlugSchema = z
  .string()
  .refine((s) => (INSIGHTS_CATEGORY_SLUGS as readonly string[]).includes(s), {
    message: "unknown Insights category slug",
  });

export const tagInputSchema = z.object({
  name: z.string().min(1).max(60),
  slug: z
    .string()
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
});

export const newsSourceInputSchema = z.object({
  name: z.string().min(2).max(200),
  base_url: z.string().url().max(2048),
  feed_url: z.string().url().max(2048).optional(),
  source_type: z.enum(SOURCE_KINDS),
  category: z.string().max(80).optional(),
  enabled: z.boolean().default(true),
  trust_score: z.number().min(0).max(100).default(50),
  priority: z.number().int().default(100),
  configuration: z.record(z.string(), z.unknown()).default({}),
});

export const rejectCandidateSchema = z.object({
  id: uuid,
  reason: z.string().max(500).optional(),
});
