import { describe, it, expect } from "vitest";
import {
  articleCreateSchema,
  scheduleArticleSchema,
  newsSourceInputSchema,
  categorySlugSchema,
} from "./schemas";

const UUID = "00000000-0000-4000-8000-000000000000";

describe("articleCreateSchema", () => {
  it("accepts a minimal valid payload and applies defaults", () => {
    const parsed = articleCreateSchema.parse({
      title: "Google launches new Gemini model",
      category_id: UUID,
    });
    expect(parsed.status).toBe("draft");
    expect(parsed.content_format).toBe("markdown");
    expect(parsed.content_type).toBe("news");
    expect(parsed.featured).toBe(false);
  });

  it("rejects a missing category", () => {
    expect(() =>
      articleCreateSchema.parse({ title: "No category here" }),
    ).toThrow();
  });

  it("rejects a too-short title", () => {
    expect(() =>
      articleCreateSchema.parse({ title: "x", category_id: UUID }),
    ).toThrow();
  });

  it("rejects a non-slug slug and a bad status", () => {
    expect(() =>
      articleCreateSchema.parse({
        title: "Valid title",
        category_id: UUID,
        slug: "Not A Slug",
      }),
    ).toThrow();
    expect(() =>
      articleCreateSchema.parse({
        title: "Valid title",
        category_id: UUID,
        status: "published",
      }),
    ).toThrow();
  });

  it("validates nested source URLs", () => {
    expect(() =>
      articleCreateSchema.parse({
        title: "Valid title",
        category_id: UUID,
        sources: [{ source_name: "The Verge", source_url: "not-a-url" }],
      }),
    ).toThrow();
  });
});

describe("scheduleArticleSchema", () => {
  it("accepts a future timestamp", () => {
    const when = new Date(Date.now() + 3_600_000).toISOString();
    expect(scheduleArticleSchema.parse({ id: UUID, scheduled_at: when }).id).toBe(
      UUID,
    );
  });
  it("rejects a past timestamp", () => {
    const when = new Date(Date.now() - 1000).toISOString();
    expect(() =>
      scheduleArticleSchema.parse({ id: UUID, scheduled_at: when }),
    ).toThrow();
  });
});

describe("newsSourceInputSchema", () => {
  it("requires a known source_type", () => {
    expect(() =>
      newsSourceInputSchema.parse({
        name: "Example",
        base_url: "https://example.com",
        source_type: "carrier-pigeon",
      }),
    ).toThrow();
  });
});

describe("categorySlugSchema", () => {
  it("accepts a seeded category slug", () => {
    expect(categorySlugSchema.parse("cybersecurity")).toBe("cybersecurity");
  });
  it("rejects an unknown slug", () => {
    expect(() => categorySlugSchema.parse("crypto-moonshots")).toThrow();
  });
});
