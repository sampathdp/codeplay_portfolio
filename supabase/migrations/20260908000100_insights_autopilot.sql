-- CodePlay Insights — Phase 9: Autopilot
--
-- Turns the pipeline end-to-end autonomous:
--   1. discovery (`run.ts discover --select`) auto-queues a `full_article`
--      generation job for each daily diverse pick,
--   2. the generation worker drafts + illustrates each one (unchanged),
--   3. after the draft loop the worker ranks the day's `review` drafts and
--      flips the best `minPerDay..maxPerDay` (diverse) to `published`,
--   4. `.github/workflows/insights-refresh.yml` commits the regenerated
--      snapshot to `main`, firing the existing FTPS deploy.
--
-- The single switch is `insights_settings.publishing.autoPublish`. Set it
-- back to `false` (here or in the admin Settings screen) to return to the
-- fully manual "generate drafts, an editor approves" behaviour — nothing
-- else changes.
--
-- Quality gates still apply: a draft that fails a hard gate lands as
-- `draft` (not `review`) and is never seen by the auto-publisher. A draft
-- flagged `needs_review` IS eligible (fully-autonomous mode).

update insights_settings
   set value = value
     || jsonb_build_object(
          'autoPublish', true,
          'autoQueue', true,
          'maxPerCategory', 2,
          'rankWeights', jsonb_build_object(
            'quality', 0.6,
            'viral',   0.35,
            'breaking', 8
          )
        ),
       description = 'Autopilot: discovery auto-queues generation and the '
                     || 'worker auto-publishes the day''s best drafts. '
                     || 'Flip autoPublish=false for manual editorial approval.'
 where key = 'publishing';

-- Safety net: if the Phase 7 row was never seeded, create it enabled.
insert into insights_settings (key, value, description)
select
  'publishing',
  jsonb_build_object(
    'autoPublish', true,
    'autoQueue', true,
    'minPerDay', 2,
    'maxPerDay', 3,
    'maxPerCategory', 2,
    'rankWeights', jsonb_build_object('quality', 0.6, 'viral', 0.35, 'breaking', 8),
    'breakingOverridesDiversity', true
  ),
  'Autopilot: discovery auto-queues generation and the worker auto-publishes the day''s best drafts.'
where not exists (select 1 from insights_settings where key = 'publishing');
