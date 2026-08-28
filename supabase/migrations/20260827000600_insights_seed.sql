-- CodePlay Insights — Phase 2
-- Migration 6/6: idempotent seed data (categories + editorial author).
-- Tags are intentionally NOT seeded — they are created on demand from the
-- admin panel / pipeline and must never be hardcoded.

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------

insert into insights_categories (name, slug, description, seo_title, seo_description, sort_order)
values
  ('Artificial Intelligence', 'artificial-intelligence',
   'Models, research, tooling, and the practical impact of AI on how software is built and used.',
   'AI News & Analysis | CodePlay Insights',
   'Original analysis on artificial intelligence — models, research, and what each development means for developers and businesses.', 1),

  ('Software Development', 'software-development',
   'Languages, frameworks, architecture, engineering practice, and the craft of shipping software.',
   'Software Development News & Analysis | CodePlay Insights',
   'Deep dives on languages, frameworks, architecture and engineering practice, with a working developer''s take.', 2),

  ('Web Development', 'web-development',
   'Browsers, frontend frameworks, web platform APIs, performance, and full-stack web work.',
   'Web Development News & Analysis | CodePlay Insights',
   'Browser platform changes, framework releases and performance work explained for people who ship for the web.', 3),

  ('Mobile Development', 'mobile-development',
   'iOS, Android, cross-platform toolkits, app-store shifts, and mobile product engineering.',
   'Mobile Development News & Analysis | CodePlay Insights',
   'iOS, Android and cross-platform news with the technical and business impact for mobile teams.', 4),

  ('Game Development', 'game-development',
   'Engines, graphics, tooling, studios, and the technical side of making games.',
   'Game Development News & Analysis | CodePlay Insights',
   'Engine updates, graphics tech and studio news analysed for the people building games.', 5),

  ('Gaming', 'gaming',
   'Releases, hardware, platforms, and the business of the games industry.',
   'Gaming Industry News & Analysis | CodePlay Insights',
   'Game releases, platform moves and industry business analysis — beyond the press release.', 6),

  ('Gaming Community', 'gaming-community',
   'Player culture, modding, esports, creators, and community-driven moments.',
   'Gaming Community News & Analysis | CodePlay Insights',
   'Modding, esports, creators and player culture — the community side of games, with context.', 7),

  ('Cybersecurity', 'cybersecurity',
   'Vulnerabilities, breaches, defensive practice, and security''s effect on developers.',
   'Cybersecurity News & Analysis | CodePlay Insights',
   'Vulnerabilities, breaches and defensive practice explained, with concrete recommendations for developers.', 8),

  ('Cloud & DevOps', 'cloud-and-devops',
   'Cloud platforms, infrastructure, CI/CD, observability, and operating software at scale.',
   'Cloud & DevOps News & Analysis | CodePlay Insights',
   'Cloud platform changes, infrastructure and CI/CD news with the operational impact spelled out.', 9),

  ('Developer Tools', 'developer-tools',
   'Editors, CLIs, package ecosystems, AI coding assistants, and the everyday developer toolchain.',
   'Developer Tools News & Analysis | CodePlay Insights',
   'Editors, CLIs, package ecosystems and AI coding assistants — what actually changes in your workflow.', 10),

  ('Hardware & GPUs', 'hardware-and-gpus',
   'Chips, GPUs, accelerators, devices, and the hardware layer under modern software.',
   'Hardware & GPU News & Analysis | CodePlay Insights',
   'Chips, GPUs and accelerators analysed for developers who need to know what the hardware layer means.', 11),

  ('Startups', 'startups',
   'Founders, funding, product launches, and lessons from early-stage technology companies.',
   'Startup News & Analysis | CodePlay Insights',
   'Funding, launches and founder lessons from early-stage tech, with the practical takeaways.', 12),

  ('SaaS', 'saas',
   'Software-as-a-service products, pricing, growth, and the economics of subscription software.',
   'SaaS News & Analysis | CodePlay Insights',
   'SaaS product, pricing and growth news with the business and engineering implications.', 13),

  ('Big Tech', 'big-tech',
   'Strategy, regulation, and product moves from the largest technology companies.',
   'Big Tech News & Analysis | CodePlay Insights',
   'Strategy, regulation and product moves from the largest tech companies — what it means downstream.', 14),

  ('Open Source', 'open-source',
   'Projects, licensing, governance, funding, and the health of the open-source ecosystem.',
   'Open Source News & Analysis | CodePlay Insights',
   'Licensing, governance and funding news across open source, with context for maintainers and users.', 15),

  ('Emerging Technology', 'emerging-technology',
   'Early-stage and frontier technology — from robotics to novel computing — and why it matters.',
   'Emerging Technology News & Analysis | CodePlay Insights',
   'Frontier technology — robotics, novel computing and more — explained with a grounded developer''s take.', 16)
on conflict (slug) do update set
  name            = excluded.name,
  description     = excluded.description,
  seo_title       = excluded.seo_title,
  seo_description = excluded.seo_description,
  sort_order      = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Default editorial author
-- ---------------------------------------------------------------------------

insert into insights_authors (name, slug, bio, role, expertise, social_links, is_team)
values (
  'CodePlay Studios Editorial Team',
  'codeplay-studios-editorial-team',
  'The CodePlay Studios editorial team covers technology, AI, software and game development, cybersecurity, and the startup ecosystem. Every article pairs primary-source reporting with a working engineer''s analysis of the business and developer impact.',
  'Editorial Team',
  array['Artificial Intelligence', 'Software Development', 'Game Development', 'Cybersecurity', 'Startups'],
  jsonb_build_object(
    'website', 'https://codeplaystudios.com',
    'twitter', 'https://twitter.com/codeplaystudios',
    'linkedin', 'https://linkedin.com/company/codeplaystudios',
    'github',  'https://github.com/codeplaystudios'
  ),
  true
)
on conflict (slug) do update set
  bio          = excluded.bio,
  role         = excluded.role,
  expertise    = excluded.expertise,
  social_links = excluded.social_links;
