/** Physical table names — single source of truth for the admin API layer. */
export const T = {
  categories: "insights_categories",
  authors: "insights_authors",
  tags: "insights_tags",
  articles: "insights_articles",
  articleTags: "insights_article_tags",
  articleSources: "insights_article_sources",
  articleQuality: "insights_article_quality",
  newsSources: "insights_news_sources",
  newsCandidates: "insights_news_candidates",
  generationJobs: "insights_content_generation_jobs",
  admins: "insights_admins",
  auditLogs: "insights_admin_action_logs",
  settings: "insights_settings",
  topicClusters: "insights_topic_clusters",
  ingestionRuns: "insights_ingestion_runs",
  aiUsage: "insights_ai_usage",
  imageAssets: "insights_image_assets",
} as const;

export const INSIGHTS_MEDIA_BUCKET = "insights-media";

/** RPC (security-definer) function names. */
export const RPC = {
  publishArticle: "insights_publish_article",
  unpublishArticle: "insights_unpublish_article",
  scheduleArticle: "insights_schedule_article",
  archiveArticle: "insights_archive_article",
  approveCandidate: "insights_approve_candidate",
  rejectCandidate: "insights_reject_candidate",
  selectCluster: "insights_select_cluster",
  rejectCluster: "insights_reject_cluster",
  ignoreCluster: "insights_ignore_cluster",
  forceResearchCluster: "insights_force_research_cluster",
  mergeClusters: "insights_merge_clusters",
  setSetting: "insights_set_setting",
  requestGeneration: "insights_request_generation",
  applySection: "insights_apply_section",
  approveArticle: "insights_approve_article",
  markSectionsEdited: "insights_mark_sections_edited",
  requestImage: "insights_request_image",
  setImagePrompt: "insights_set_image_prompt",
  setManualImage: "insights_set_manual_image",
  removeImage: "insights_remove_image",
  requestSourceRun: "insights_request_source_run",
  retryJob: "insights_retry_job",
  recordView: "insights_record_view",
} as const;
