# CodePlay Insights — Supabase

Database, auth and RLS for the CodePlay Insights content platform. See
`docs/codeplay-insights-architecture.md` and
`docs/codeplay-insights-database.md`.

## Migrations

| File | Contents |
| --- | --- |
| `20260827000100_insights_enums_and_taxonomy.sql` | enums, `insights_categories`, `insights_authors`, `insights_tags`, `insights_touch_updated_at()` |
| `20260827000200_insights_articles.sql` | `insights_articles`, `insights_article_tags`, `insights_article_sources`, `insights_article_quality` |
| `20260827000300_insights_pipeline.sql` | `insights_news_sources`, `insights_news_candidates`, `insights_content_generation_jobs`, `insights_admins`, `insights_admin_action_logs`, `insights_articles.candidate_id` |
| `20260827000400_insights_functions_triggers.sql` | slug generation, article write trigger, `source_count` sync, identity helpers, authorized workflow RPCs |
| `20260827000500_insights_rls.sql` | RLS enable + policies + role / function grants |
| `20260827000600_insights_seed.sql` | idempotent seed: 16 categories + editorial author |

## Applying

```bash
# hosted project
supabase link --project-ref <ref>
supabase db push

# or directly
psql "$SUPABASE_DB_URL" -f supabase/migrations/20260827000100_insights_enums_and_taxonomy.sql
# ...in order
```

## Granting admin access

There is no public signup. To make someone an admin:

1. Invite them in the Supabase dashboard (Auth → Users → Invite) so an
   `auth.users` row exists.
2. Run, as the service role / SQL editor:

   ```sql
   select insights_grant_admin('person@example.com', 'admin');
   ```

`insights_grant_admin` and `insights_publish_due_scheduled` are
**service-role only** — `execute` is revoked from `public`.

## Keys

| Key | Where it lives | Never |
| --- | --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | browser bundle (fine — RLS enforces access) | — |
| `SUPABASE_SERVICE_ROLE_KEY` | GitHub Actions secrets, cron worker | in the browser / repo |
| `GEMINI_API_KEY`, `CRON_SECRET` | server / CI only | in the browser / repo |

## Scheduled publishing

A cron job (GitHub Actions or `pg_cron`) calls, with the service role:

```sql
select insights_publish_due_scheduled();
```

which flips `scheduled` articles whose `scheduled_at` has passed to
`published`.
