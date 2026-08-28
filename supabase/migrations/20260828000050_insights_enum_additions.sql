-- CodePlay Insights — Phase 3
-- Enum additions. Kept in its own migration so the new values are
-- committed before any later migration references them (Postgres forbids
-- using a freshly-added enum value in the same transaction that adds it).

-- Fact-confidence classification for candidates and topic clusters.
do $$ begin
  create type insights_fact_confidence as enum (
    'verified',        -- confirmed by an official / first-party source
    'likely',          -- multiple reputable secondary sources agree
    'community_rumor',  -- community chatter only, not confirmed
    'unverified'       -- single low-authority mention
  );
exception when duplicate_object then null; end $$;

-- "ignore" as a distinct triage outcome (not the same as an editorial reject).
alter type insights_candidate_status add value if not exists 'ignored';
