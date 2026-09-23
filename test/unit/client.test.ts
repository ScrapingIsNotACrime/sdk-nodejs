import { describe, expect, it } from "vitest";
import { ScrapingIsNotACrime } from "../../src/client.js";

describe("ScrapingIsNotACrime", () => {
  it("fails fast without an API key", () => {
    const saved = process.env.SCRAPINGISNOTACRIME_API_KEY;
    delete process.env.SCRAPINGISNOTACRIME_API_KEY;
    try {
      expect(() => new ScrapingIsNotACrime()).toThrow(/SCRAPINGISNOTACRIME_API_KEY/);
    } finally {
      if (saved !== undefined) process.env.SCRAPINGISNOTACRIME_API_KEY = saved;
    }
  });

  it("exposes one namespace per platform", () => {
    const client = new ScrapingIsNotACrime({ apiKey: "sinac_test", fetch: (async () => new Response()) as typeof fetch });
    for (const name of ["linktree", "twitch", "youtube", "tiktok", "appstore", "bluesky", "github", "hackernews"] as const) {
      expect(typeof client[name]).toBe("object");
    }
  });
});
