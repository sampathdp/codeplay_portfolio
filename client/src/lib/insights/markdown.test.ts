import { describe, it, expect } from "vitest";
import { renderMarkdown, renderArticleBody, slugifyHeading } from "./markdown";

describe("renderMarkdown", () => {
  it("escapes HTML in content (safe for dangerouslySetInnerHTML)", () => {
    const html = renderMarkdown("A <script>alert(1)</script> B & C");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
  });

  it("renders headings with ids and applies the shift", () => {
    const html = renderMarkdown("# Title\n\n## Section", { headingShift: 1 });
    expect(html).toContain('<h2 id="title">Title</h2>');
    expect(html).toContain('<h3 id="section">Section</h3>');
  });

  it("renders paragraphs, bold, italic and inline code", () => {
    const html = renderMarkdown("This is **bold**, *italic* and `code`.");
    expect(html).toBe(
      "<p>This is <strong>bold</strong>, <em>italic</em> and <code>code</code>.</p>",
    );
  });

  it("renders unordered and ordered lists", () => {
    expect(renderMarkdown("- a\n- b")).toBe("<ul>\n<li>a</li>\n<li>b</li>\n</ul>");
    expect(renderMarkdown("1. a\n2. b")).toBe("<ol>\n<li>a</li>\n<li>b</li>\n</ol>");
  });

  it("marks external links with rel/target, leaves internal links bare", () => {
    const ext = renderMarkdown("[Verge](https://theverge.com/x)");
    expect(ext).toContain('target="_blank"');
    expect(ext).toContain('rel="noopener noreferrer nofollow"');

    const int = renderMarkdown("[About](/about)");
    expect(int).toContain('href="/about"');
    expect(int).not.toContain("target=");
  });

  it("renders fenced code blocks without interpreting markdown inside", () => {
    const html = renderMarkdown("```js\nconst x = **1**\n```");
    expect(html).toContain("<pre><code");
    expect(html).toContain("const x = **1**");
    expect(html).not.toContain("<strong>");
  });

  it("renders blockquotes and horizontal rules", () => {
    expect(renderMarkdown("> quoted")).toBe("<blockquote>quoted</blockquote>");
    expect(renderMarkdown("---")).toBe("<hr />");
  });
});

describe("renderArticleBody", () => {
  it("collects headings and shifts body to h2+", () => {
    const { html, headings } = renderArticleBody("## What Happened?\n\nText.\n\n## Verdict\n\nDone.");
    expect(headings.map((h) => h.text)).toEqual(["What Happened?", "Verdict"]);
    expect(headings[0].level).toBe(3); // shifted
    expect(html).toContain('id="what-happened"');
  });
});

describe("slugifyHeading", () => {
  it("kebab-cases and strips punctuation", () => {
    expect(slugifyHeading("CodePlay Developer Take!")).toBe("codeplay-developer-take");
  });
});
