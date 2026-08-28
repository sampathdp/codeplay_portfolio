-- CodePlay Insights — Phase 3
-- Seed: engine settings + free-first source registry.
-- Idempotent (upsert by key / name).

-- ---------------------------------------------------------------------------
-- Engine settings. The TypeScript engine (insights-engine/src/config.ts)
-- carries the authoritative defaults; these rows let an admin override
-- them without a deploy.
-- ---------------------------------------------------------------------------

insert into insights_settings (key, value, description) values
(
  'scoring',
  jsonb_build_object(
    'weights', jsonb_build_object(
      'freshness', 0.20, 'engagement', 0.20, 'sourceAuthority', 0.15,
      'crossSourceCoverage', 0.15, 'codeplayRelevance', 0.15,
      'communityMomentum', 0.10, 'novelty', 0.05
    ),
    'freshnessHalfLifeHours', 18,
    'freshnessMaxAgeHours', 96,
    'noveltyWindowHours', 72,
    'engagementCaps', jsonb_build_object(
      'hnPoints', 800, 'hnComments', 400, 'redditScore', 5000, 'redditComments', 1200
    )
  ),
  'Viral score weights (sum ~1.0) and normalisation caps. Score is 0-100.'
),
(
  'selection',
  jsonb_build_object(
    'timezone', 'Asia/Colombo',
    'perDay', 3,
    'minPerDay', 2,
    'minViralScore', 45,
    'lookbackHours', 36,
    'maxPerTheme', 1,
    'maxPerCategory', 2,
    'requireDistinctPrimaryTheme', true,
    'diversity', jsonb_build_array(
      jsonb_build_object('slot', 1, 'label', 'Major AI / software / tech development'),
      jsonb_build_object('slot', 2, 'label', 'Developer / business technology story'),
      jsonb_build_object('slot', 3, 'label', 'Gaming / game development / community story')
    )
  ),
  'selectDailyArticleCandidates() rules. 2-3 per day, theme-diverse.'
),
(
  'scheduler',
  jsonb_build_object(
    'timezone', 'Asia/Colombo',
    'discovery', jsonb_build_object(
      'cronsUtc', jsonb_build_array('0 3,7,10,14,17,21 * * *'),
      'note', 'GitHub Actions cron is UTC. Discovery runs several times/day.'
    ),
    'publishWindowsLocal', jsonb_build_array('08:30', '15:30', '22:30'),
    'maxArticlesPerDay', 3
  ),
  'When to gather candidates and the local publish windows (Phase 4).'
),
(
  'breaking',
  jsonb_build_object(
    'maxAgeHours', 12,
    'minSources', 2,
    'minAuthority', 80,
    'minCommunityScore', 60
  ),
  'Thresholds for the breaking/trending classification. Rumors excluded.'
),
(
  'community',
  jsonb_build_object(
    'enabled', false,
    'requiresCredentials', true,
    'note', 'Reddit adapter. Set REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET and enable.'
  ),
  'Community (Reddit) signal adapter toggle.'
)
on conflict (key) do update set value = excluded.value, description = excluded.description;

-- ---------------------------------------------------------------------------
-- Source registry — FREE-FIRST. `enabled=false` marks sources whose exact
-- feed URL still needs confirmation or that require credentials; the RSS
-- adapter is generic so an admin can fix the URL and flip `enabled`.
-- ---------------------------------------------------------------------------

insert into insights_news_sources
  (name, slug, adapter, source_type, base_url, feed_url, category, enabled, trust_score, priority, configuration)
values
-- 1. Hacker News official API ------------------------------------------------
('Hacker News', 'hacker-news', 'hackernews', 'api',
 'https://news.ycombinator.com', null, 'developer-tools', true, 65, 10,
 jsonb_build_object('streams', jsonb_build_array('topstories','beststories','newstories'),
                    'includeShowHN', true, 'maxItems', 90, 'minPoints', 40)),

-- 2. Official technology / company sources ---------------------------------
('OpenAI News',            'openai-news',            'rss', 'official', 'https://openai.com/news',            'https://openai.com/news/rss.xml',                 'artificial-intelligence', true,  95, 20, '{}'),
('Anthropic News',         'anthropic-news',         'rss', 'official', 'https://www.anthropic.com/news',     'https://www.anthropic.com/rss.xml',               'artificial-intelligence', false, 95, 20, jsonb_build_object('note','confirm feed url')),
('Google — The Keyword (AI)','google-keyword-ai',    'rss', 'official', 'https://blog.google',               'https://blog.google/technology/ai/rss/',          'artificial-intelligence', true,  92, 25, '{}'),
('Google Developers Blog', 'google-developers-blog', 'rss', 'official', 'https://developers.googleblog.com',  'https://developers.googleblog.com/feeds/posts/default', 'software-development', true, 90, 25, '{}'),
('Google DeepMind Blog',   'google-deepmind-blog',   'rss', 'official', 'https://deepmind.google',           'https://deepmind.google/blog/rss.xml',            'artificial-intelligence', false, 93, 25, jsonb_build_object('note','confirm feed url')),
('Meta AI Blog',           'meta-ai-blog',           'rss', 'official', 'https://ai.meta.com/blog',          'https://ai.meta.com/blog/rss/',                   'artificial-intelligence', false, 90, 30, jsonb_build_object('note','confirm feed url')),
('Engineering at Meta',    'engineering-at-meta',    'rss', 'official', 'https://engineering.fb.com',        'https://engineering.fb.com/feed/',                'software-development', true, 88, 30, '{}'),
('Official Microsoft Blog','official-microsoft-blog','rss', 'official', 'https://blogs.microsoft.com',       'https://blogs.microsoft.com/feed/',               'big-tech', true, 88, 30, '{}'),
('GitHub Blog',            'github-blog',            'rss', 'official', 'https://github.blog',               'https://github.blog/feed/',                       'developer-tools', true, 88, 25, '{}'),
('GitHub Changelog',       'github-changelog',       'rss', 'release_feed', 'https://github.blog/changelog', 'https://github.blog/changelog/feed/',             'developer-tools', true, 90, 20, '{}'),
('Apple Newsroom',         'apple-newsroom',         'rss', 'official', 'https://www.apple.com/newsroom',    'https://www.apple.com/newsroom/rss-feed.rss',     'big-tech', true, 92, 30, '{}'),
('NVIDIA Blog',            'nvidia-blog',            'rss', 'official', 'https://blogs.nvidia.com',          'https://blogs.nvidia.com/feed/',                  'hardware-and-gpus', true, 85, 30, '{}'),
('NVIDIA Developer Blog',  'nvidia-developer-blog',  'rss', 'official', 'https://developer.nvidia.com/blog', 'https://developer.nvidia.com/blog/feed/',         'hardware-and-gpus', false, 85, 35, jsonb_build_object('note','confirm feed url')),
('AMD Newsroom',           'amd-newsroom',           'rss', 'official', 'https://www.amd.com/en/newsroom.html', null,                                          'hardware-and-gpus', false, 82, 40, jsonb_build_object('note','no public feed found')),
('Cloudflare Blog',        'cloudflare-blog',        'rss', 'official', 'https://blog.cloudflare.com',       'https://blog.cloudflare.com/rss/',                'cloud-and-devops', true, 85, 30, '{}'),
('Vercel Blog',            'vercel-blog',            'rss', 'official', 'https://vercel.com/blog',           'https://vercel.com/atom',                         'web-development', false, 80, 35, jsonb_build_object('note','confirm feed url')),
('Supabase Blog',          'supabase-blog',          'rss', 'official', 'https://supabase.com/blog',         'https://supabase.com/rss.xml',                    'developer-tools', true, 80, 30, '{}'),
('Firebase Blog',          'firebase-blog',          'rss', 'official', 'https://firebase.blog',             'https://firebase.blog/rss.xml',                   'developer-tools', false, 80, 35, jsonb_build_object('note','confirm feed url')),
('AWS News Blog',          'aws-news-blog',          'rss', 'official', 'https://aws.amazon.com/blogs/aws',  'https://aws.amazon.com/blogs/aws/feed/',          'cloud-and-devops', true, 85, 30, '{}'),

-- 3. Developer release feeds ---------------------------------------------------
('GitHub Releases — Core Frameworks', 'github-releases-core', 'github_releases', 'release_feed',
 'https://github.com', null, 'software-development', true, 88, 15,
 jsonb_build_object('repos', jsonb_build_array(
   'facebook/react','vercel/next.js','nodejs/node','denoland/deno','oven-sh/bun',
   'vitejs/vite','microsoft/TypeScript','flutter/flutter','angular/angular',
   'vuejs/core','sveltejs/svelte','tailwindlabs/tailwindcss','supabase/supabase'
 ), 'perRepo', 3)),
('React Blog',       'react-blog',       'rss', 'official', 'https://react.dev/blog',    'https://react.dev/rss.xml',            'web-development', true, 88, 25, '{}'),
('Node.js Blog',     'nodejs-blog',      'rss', 'official', 'https://nodejs.org/en/blog','https://nodejs.org/en/feed/blog.xml',   'web-development', true, 88, 25, '{}'),
('Deno Blog',        'deno-blog',        'rss', 'official', 'https://deno.com/blog',     'https://deno.com/feed',                 'web-development', false, 82, 30, jsonb_build_object('note','confirm feed url')),
('Python Insider',   'python-insider',   'rss', 'official', 'https://blog.python.org',   'https://feeds.feedburner.com/PythonInsider', 'software-development', true, 85, 30, '{}'),

-- 4. Gaming sources --------------------------------------------------------
('PlayStation.Blog', 'playstation-blog', 'rss', 'official', 'https://blog.playstation.com', 'https://blog.playstation.com/feed/', 'gaming', true, 85, 30, '{}'),
('Xbox Wire',        'xbox-wire',        'rss', 'official', 'https://news.xbox.com',        'https://news.xbox.com/en-us/feed/',  'gaming', true, 85, 30, '{}'),
('Nintendo — What''s New', 'nintendo-whats-new', 'rss', 'official', 'https://www.nintendo.com/whatsnew', null, 'gaming', false, 85, 35, jsonb_build_object('note','no stable public feed')),
('Steam News',       'steam-news',       'rss', 'official', 'https://store.steampowered.com/news', 'https://store.steampowered.com/feeds/news/', 'gaming', false, 78, 35, jsonb_build_object('note','feed is per-app; confirm aggregate')),
('Epic Games Store News', 'epic-games-store-news', 'rss', 'official', 'https://store.epicgames.com/en-US/news', null, 'gaming', false, 80, 35, jsonb_build_object('note','confirm feed url')),
('Unreal Engine News','unreal-engine-news','rss', 'official', 'https://www.unrealengine.com/en-US/news', 'https://www.unrealengine.com/en-US/rss', 'game-development', false, 85, 30, jsonb_build_object('note','confirm feed url')),
('Unity Blog',       'unity-blog',       'rss', 'official', 'https://unity.com/blog', 'https://unity.com/blog/feed/rss', 'game-development', false, 82, 30, jsonb_build_object('note','confirm feed url')),
('GamesIndustry.biz','gamesindustry-biz','rss', 'rss',      'https://www.gamesindustry.biz', 'https://www.gamesindustry.biz/feed', 'gaming', false, 68, 45, jsonb_build_object('note','trade press — discovery signal only, cite + link')),

-- 5. Gaming community signals (needs credentials) ------------------------
('Reddit — Tech & Gaming Signal', 'reddit-tech-gaming', 'reddit', 'community',
 'https://oauth.reddit.com', null, 'gaming', false, 45, 60,
 jsonb_build_object(
   'subreddits', jsonb_build_array(
     'technology','artificial','LocalLLaMA','programming','webdev','gamedev',
     'Unity3D','unrealengine','gaming','pcgaming','Games','Steam','indiegaming'
   ),
   'listing', 'hot', 'limit', 50, 'minScore', 150,
   'note', 'Official API only. Treat posts as trend signals, not verified facts.'
 ))
on conflict (name) do update set
  adapter       = excluded.adapter,
  source_type   = excluded.source_type,
  base_url      = excluded.base_url,
  feed_url      = excluded.feed_url,
  category      = excluded.category,
  trust_score   = excluded.trust_score,
  priority      = excluded.priority,
  configuration = excluded.configuration;
