-- CodePlay Insights — Phase 8 follow-up
-- Broaden gaming coverage. The Phase 3 seed only left PlayStation.Blog and
-- Xbox Wire enabled — both first-party PR feeds — so mainstream gaming
-- news (e.g. GTA 6 / Rockstar, cross-platform releases, industry moves)
-- never reached the discovery pipeline.
--
-- These are public RSS feeds. The pipeline stays an aggregator: it ingests
-- headline + link + short excerpt only, clusters them as leads, and every
-- generated article cites and links back to the original.

-- Turn on the trade-press feed that was seeded but disabled.
update insights_news_sources set enabled = true
where slug = 'gamesindustry-biz';

-- NB: Rockstar Games killed their public Newswire RSS feed in a past site
-- redesign — there is no working first-party Rockstar/GTA feed. GTA / Red
-- Dead coverage comes through the gaming-press feeds below instead.

insert into insights_news_sources
  (name, slug, adapter, source_type, base_url, feed_url, category, enabled, trust_score, priority, configuration)
values
  ('Eurogamer', 'eurogamer', 'rss', 'rss',
   'https://www.eurogamer.net', 'https://www.eurogamer.net/feed',
   'gaming', true, 70, 40, jsonb_build_object('note','gaming press — discovery signal, cite + link')),

  ('Rock Paper Shotgun', 'rock-paper-shotgun', 'rss', 'rss',
   'https://www.rockpapershotgun.com', 'https://www.rockpapershotgun.com/feed',
   'gaming', true, 68, 42, jsonb_build_object('note','PC gaming press — discovery signal, cite + link')),

  ('PC Gamer', 'pc-gamer', 'rss', 'rss',
   'https://www.pcgamer.com', 'https://www.pcgamer.com/rss/',
   'gaming', true, 68, 42, jsonb_build_object('note','gaming press — discovery signal, cite + link')),

  ('The Verge — Games', 'the-verge-games', 'rss', 'rss',
   'https://www.theverge.com/games', 'https://www.theverge.com/rss/games/index.xml',
   'gaming', true, 72, 40, jsonb_build_object('note','tech/gaming press — discovery signal, cite + link')),

  ('Game Developer', 'game-developer', 'rss', 'rss',
   'https://www.gamedeveloper.com', 'https://www.gamedeveloper.com/rss.xml',
   'game-development', true, 74, 38, jsonb_build_object('note','game-dev trade press — discovery signal, cite + link')),

  ('IGN — Games', 'ign-games', 'rss', 'rss',
   'https://www.ign.com', 'https://feeds.ign.com/ign/games-all',
   'gaming', true, 64, 46, jsonb_build_object('note','large feed; discovery signal, cite + link'))
on conflict (slug) where slug is not null do update
  set enabled     = excluded.enabled,
      feed_url    = excluded.feed_url,
      trust_score = excluded.trust_score,
      priority    = excluded.priority;

-- Dead feeds observed returning 404/403 — turn them off so a run isn't
-- noisy. Re-enable from the Sources page if a working feed URL turns up.
update insights_news_sources set enabled = false
where slug in ('python-insider', 'push-square', 'rockstar-newswire');
