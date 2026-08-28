/**
 * Static E-E-A-T / trust pages for CodePlay Insights.
 *
 * Wording is deliberately conservative: it describes the process CodePlay
 * actually follows and does not claim credentials, awards, or first-hand
 * testing that CodePlay has not supplied.
 */

import { INSIGHTS_BASE } from "./routes";

export interface EditorialPage {
  slug: string;
  /** URL path relative to the site root. */
  path: string;
  title: string;
  description: string;
  /** Markdown — rendered with the shared renderer (headings start at h2). */
  body: string;
}

const PAGES: Record<string, Omit<EditorialPage, "path">> = {
  about: {
    slug: "about",
    title: "About CodePlay Insights",
    description:
      "What CodePlay Insights is, who writes it, and why a software studio publishes technology analysis.",
    body: `CodePlay Insights is the editorial section of [CodePlay Studios](/about), a
software and game development studio based in Panadura, Sri Lanka.

We publish original analysis on artificial intelligence, software
development, web and mobile engineering, game development, gaming,
cybersecurity, hardware and startups. Every article starts from a primary
source — an official announcement, a release note, a research paper, a
maintainer's post — and adds the part that is usually missing from the
news cycle: what it actually changes for the people who build and ship
software.

## Why a studio publishes this

CodePlay Studios builds production systems and games for clients. The same
questions our engineers ask internally — *is this real, is it ready, what
does it cost, what breaks* — are the questions this section answers in
public. It is not a press-release feed and it is not sponsored coverage.

## What you can expect

- Confirmed facts are separated from analysis, prediction and opinion.
- Community rumours are labelled as rumours, never reported as fact.
- Sources are linked. Original reporting belongs to its publishers.
- AI tools may assist the workflow; a human editor is responsible for
  every published article. See our [AI Usage Policy](${INSIGHTS_BASE}/ai-policy).

## Contact

Corrections, questions and story tips: use the
[contact form](/contact) or email info@codeplaystudios.com. Our full
[Editorial Policy](${INSIGHTS_BASE}/editorial-policy) and
[Corrections Policy](${INSIGHTS_BASE}/corrections) describe how we work.`,
  },

  "editorial-policy": {
    slug: "editorial-policy",
    title: "Editorial Policy",
    description:
      "How CodePlay Insights sources, writes, reviews and publishes articles.",
    body: `This policy describes how CodePlay Insights produces articles. It applies
to everything published in the [Insights](${INSIGHTS_BASE}) section.

## Sourcing

We are an aggregator of *leads*, not a scraper of *content*. We monitor
official blogs, first-party APIs, permitted RSS and release feeds, and
public developer communities. We do not copy third-party article bodies.
Each article links the primary source, and short quotes are used only for
attribution.

## Writing

Every article is written by CodePlay's editorial team. Articles must:

- lead with the confirmed facts and cite where they come from;
- clearly separate reporting from CodePlay's analysis and predictions;
- add original value — the developer, business and, where relevant,
  gaming perspective — rather than restating the news;
- avoid hype language and never claim hands-on testing we did not do.

## Review

Before an article is published, an editor checks that:

- claims are supported by the linked sources;
- confidence is represented honestly (confirmed / likely / rumour);
- there are at least two independent sources for a news story, or the
  article is held for review;
- headlines are accurate and not clickbait;
- the piece meets our quality threshold. Drafts that fall below it stay
  in review and are not published to hit a schedule.

## Independence

CodePlay Insights articles are not paid placements. If we write about a
technology we also build with, that relationship is disclosed in the
article. Internal links to CodePlay services are marked as such.

## AI assistance

See the [AI Usage Policy](${INSIGHTS_BASE}/ai-policy).

## Corrections

See the [Corrections Policy](${INSIGHTS_BASE}/corrections).`,
  },

  "ai-policy": {
    slug: "ai-policy",
    title: "AI Usage Policy",
    description:
      "How and where AI tools assist the CodePlay Insights editorial workflow — and where human editors remain responsible.",
    body: `CodePlay Studios builds AI software, and we use AI tools in this editorial
workflow. This page explains exactly where.

## Where AI assists

- **Discovery.** Automated systems collect and cluster technology and
  gaming news from approved sources and score how significant each story
  is. Editors choose what to cover.
- **Research support.** AI tools help summarise primary sources and
  surface open questions. Every fact is checked against the source before
  it appears in an article.
- **Drafting support.** AI tools help produce a first structured draft
  from verified research notes. Drafts are not published as generated.
- **Checks.** Automated checks flag unsupported claims, missing sources,
  weak headlines and quality issues for an editor to resolve.

## Where humans are responsible

A human editor reviews and is accountable for **every** published
article. Editors verify the sources, correct the analysis, write or
rewrite the CodePlay take, and make the decision to publish. Articles
that fail our quality or fact-confidence checks are held for review
regardless of how they were drafted.

## What we don't do

- We do not auto-publish AI-generated text.
- We do not present AI predictions or community rumours as confirmed fact.
- We do not fabricate quotes, sources, dates, authors or credentials.

## Images

Featured images are AI-generated editorial illustrations unless noted
otherwise. They are labelled as such on the article and are never
presented as photographs of real events, people or products.

## Transparency

If an article's production process differs from what is described here,
that difference is noted on the article. Questions:
[contact CodePlay Studios](/contact).`,
  },

  corrections: {
    slug: "corrections",
    title: "Corrections Policy",
    description:
      "How CodePlay Insights handles errors, updates and clarifications after publication.",
    body: `We aim to be accurate. When we are not, we fix it openly.

## Reporting an error

Email info@codeplaystudios.com or use the [contact form](/contact) with
the article URL and what you believe is wrong. We review every report.

## How we correct

- **Minor fixes** (typos, formatting, broken links) are made without a
  note.
- **Factual corrections** are made in the article and the *updated* date
  is changed. Significant corrections carry a short note explaining what
  changed and when.
- **Clarifications** are added where wording was accurate but could be
  misread.
- **Retractions.** If an article's central claim proves wrong and cannot
  be fixed, the article is unpublished and replaced with a note
  explaining why.

## Updating developing stories

News stories change. When we add confirmed information to an existing
article we update the *updated* timestamp so readers can see the piece
has moved on since publication.

## Source disputes

If a primary source revises or removes the material an article relied on,
we update the article to reflect that and note the change.`,
  },
};

export function getEditorialPage(slug: string): EditorialPage | undefined {
  const p = PAGES[slug];
  if (!p) return undefined;
  return { ...p, path: `${INSIGHTS_BASE}/${p.slug}` };
}

export const EDITORIAL_PAGE_SLUGS = Object.keys(PAGES);

export function allEditorialPages(): EditorialPage[] {
  return EDITORIAL_PAGE_SLUGS.map((s) => getEditorialPage(s)!).filter(Boolean);
}
