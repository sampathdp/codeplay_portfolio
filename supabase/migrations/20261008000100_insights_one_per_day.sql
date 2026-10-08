-- ---------------------------------------------------------------------------
-- One article per day.
--
-- Autopilot used to pick, generate and publish 2–3 articles a day. It now
-- does exactly one: discovery picks the single best-ranked story, the
-- worker generates only that one, and the auto-publisher publishes it if
-- it passes the quality gates. One strong post a day beats several thin
-- ones, for readers and for AdSense review.
--
-- These rows override the code defaults (insights-engine/src/config.ts,
-- publish/autopublish.ts), so both are set to 1.
-- ---------------------------------------------------------------------------

update insights_settings
   set value = value || jsonb_build_object('perDay', 1, 'minPerDay', 1),
       description = 'selectDailyArticleCandidates() rules. 1 per day — the best-ranked story.'
 where key = 'selection';

update insights_settings
   set value = value || jsonb_build_object('maxArticlesPerDay', 1)
 where key = 'scheduler';

update insights_settings
   set value = value || jsonb_build_object('minPerDay', 1, 'maxPerDay', 1)
 where key = 'publishing';
