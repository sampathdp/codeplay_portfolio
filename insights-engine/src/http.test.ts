import { describe, it, expect, vi } from "vitest";
import { createHttpClient, HttpError } from "./http";

const cfg = {
  timeoutMs: 1000,
  retries: 3,
  backoffBaseMs: 0,
  backoffMaxMs: 0,
  minHostIntervalMs: 0,
  userAgent: "test",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("createHttpClient", () => {
  it("retries on 500 then succeeds", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({}, 500))
      .mockResolvedValueOnce(jsonResponse({}, 503))
      .mockResolvedValueOnce(jsonResponse({ ok: true }, 200));

    const client = createHttpClient(cfg, () => {}, fetchMock as unknown as typeof fetch);
    const out = await client.json<{ ok: boolean }>("https://api.test/x");

    expect(out.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("retries on 429", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({}, 429))
      .mockResolvedValueOnce(jsonResponse({ ok: 1 }, 200));
    const client = createHttpClient(cfg, () => {}, fetchMock as unknown as typeof fetch);
    await client.json("https://api.test/y");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry a 404 and throws HttpError", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, 404));
    const client = createHttpClient(cfg, () => {}, fetchMock as unknown as typeof fetch);
    await expect(client.text("https://api.test/z")).rejects.toBeInstanceOf(HttpError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("gives up after `retries` attempts on persistent failure", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, 500));
    const client = createHttpClient(cfg, () => {}, fetchMock as unknown as typeof fetch);
    await expect(client.text("https://api.test/w")).rejects.toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(cfg.retries + 1);
  });

  it("retries on a network error (thrown fetch)", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error("ECONNRESET"))
      .mockResolvedValueOnce(jsonResponse({ ok: true }, 200));
    const client = createHttpClient(cfg, () => {}, fetchMock as unknown as typeof fetch);
    const out = await client.json<{ ok: boolean }>("https://api.test/n");
    expect(out.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
