/**
 * Minimal, safe Markdown → HTML renderer for CodePlay Insights article
 * bodies. Everything is HTML-escaped first, so the output is safe to pass
 * to `dangerouslySetInnerHTML` without a sanitiser dependency.
 *
 * Supported: h1–h4, paragraphs, `- ` / `* ` and `1.` lists, `> ` quotes,
 * `---` rules, fenced ``` code blocks, `**bold**`, `*italic*`, `` `code` ``,
 * `[text](url)` links (external links get rel/target).
 */

const SITE_HOST = "codeplaystudios.com";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(s: string): string {
  let out = escapeHtml(s);
  // links: [text](url)
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g,
    (_m, text: string, href: string) => {
      const external = /^https?:\/\//.test(href) && !href.includes(SITE_HOST);
      const attrs = external
        ? ' target="_blank" rel="noopener noreferrer nofollow"'
        : "";
      return `<a href="${href}"${attrs}>${text}</a>`;
    },
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  return out;
}

type HeadingHandler = (level: number, text: string, id: string) => void;

export interface RenderOptions {
  /** Called for every heading — lets the caller build a table of contents. */
  onHeading?: HeadingHandler;
  /** Heading levels are shifted by this (e.g. 1 to render `#` as `<h2>`). */
  headingShift?: number;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export function renderMarkdown(md: string, opts: RenderOptions = {}): string {
  const shift = opts.headingShift ?? 0;
  const lines = (md ?? "").replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];

  let i = 0;
  let para: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let quote: string[] = [];

  const flushPara = () => {
    if (para.length) {
      html.push(`<p>${inline(para.join(" ")).trim()}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      html.push(`<blockquote>${inline(quote.join(" ")).trim()}</blockquote>`);
      quote = [];
    }
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushQuote();
  };

  while (i < lines.length) {
    const line = lines[i];

    // fenced code block
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      flushAll();
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      i++; // closing fence
      html.push(
        `<pre><code${fence[1] ? ` class="language-${fence[1]}"` : ""}>${escapeHtml(
          body.join("\n"),
        )}</code></pre>`,
      );
      continue;
    }

    if (/^\s*$/.test(line)) {
      flushAll();
      i++;
      continue;
    }

    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      flushAll();
      html.push("<hr />");
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushAll();
      const level = Math.min(6, heading[1].length + shift);
      const text = heading[2].trim();
      const id = slugifyHeading(text);
      opts.onHeading?.(level, text, id);
      html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    const quoteLine = line.match(/^>\s?(.*)$/);
    if (quoteLine) {
      flushPara();
      flushList();
      quote.push(quoteLine[1]);
      i++;
      continue;
    }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (bullet || numbered) {
      flushPara();
      flushQuote();
      const want: "ul" | "ol" = bullet ? "ul" : "ol";
      if (listType !== want) {
        flushList();
        listType = want;
        html.push(`<${want}>`);
      }
      html.push(`<li>${inline((bullet ?? numbered)![1])}</li>`);
      i++;
      continue;
    }

    flushList();
    flushQuote();
    para.push(line.trim());
    i++;
  }

  flushAll();
  return html.join("\n");
}

export interface Heading {
  level: number;
  text: string;
  id: string;
}

/** Render + collect headings in one pass. */
export function renderArticleBody(md: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const html = renderMarkdown(md, {
    headingShift: 1, // article <h1> is the title; body starts at <h2>
    onHeading: (level, text, id) => headings.push({ level, text, id }),
  });
  return { html, headings };
}
