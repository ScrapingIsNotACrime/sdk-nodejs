import { describe, expect, it } from "vitest";
import { API_KEY_ENV, DEFAULT_BASE_URL, resolveConfig } from "../../src/config.js";

describe("resolveConfig", () => {
  it("applies the documented defaults", () => {
    const config = resolveConfig({ apiKey: "sinac_x" }, {});
    expect(config).toMatchObject({
      apiKey: "sinac_x",
      baseUrl: DEFAULT_BASE_URL,
      timeoutMs: 30_000,
      maxRetries: 2,
    });
    expect(DEFAULT_BASE_URL).toBe("https://api.scrapingisnotacrime.com/v1");
    expect(typeof config.fetch).toBe("function");
  });

  it("reads the API key from the environment", () => {
    expect(resolveConfig({}, { [API_KEY_ENV]: "sinac_env" }).apiKey).toBe("sinac_env");
    expect(API_KEY_ENV).toBe("SCRAPINGISNOTACRIME_API_KEY");
  });

  it("prefers the explicit option over the environment", () => {
    expect(resolveConfig({ apiKey: "sinac_opt" }, { [API_KEY_ENV]: "sinac_env" }).apiKey).toBe("sinac_opt");
  });

  it("fails fast without an API key, naming the option and the variable", () => {
    expect(() => resolveConfig({}, {})).toThrow(/apiKey.*SCRAPINGISNOTACRIME_API_KEY/);
    expect(() => resolveConfig({ apiKey: "  " }, {})).toThrow(/apiKey/);
  });

  it("normalizes a trailing slash in baseUrl", () => {
    expect(resolveConfig({ apiKey: "k", baseUrl: "https://example.test/v1/" }, {}).baseUrl).toBe(
      "https://example.test/v1",
    );
  });

  it("rejects invalid numbers", () => {
    expect(() => resolveConfig({ apiKey: "k", maxRetries: -1 }, {})).toThrow(/maxRetries/);
    expect(() => resolveConfig({ apiKey: "k", timeoutMs: 0 }, {})).toThrow(/timeoutMs/);
  });
});
