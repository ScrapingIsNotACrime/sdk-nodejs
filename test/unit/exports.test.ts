import { describe, expect, it } from "vitest";
import * as sdk from "../../src/index.js";

describe("public exports", () => {
  it("exports the client, errors, Page and VERSION", () => {
    for (const name of [
      "ScrapingIsNotACrime",
      "Page",
      "ScrapingIsNotACrimeError",
      "BadRequestError",
      "AuthenticationError",
      "QuotaExceededError",
      "NotFoundError",
      "RateLimitError",
      "UpstreamError",
      "ConnectionError",
      "APIError",
      "VERSION",
    ]) {
      expect(sdk, name).toHaveProperty(name);
    }
    expect(sdk.default).toBe(sdk.ScrapingIsNotACrime);
  });

  it("keeps VERSION in sync with package.json", async () => {
    const pkg = (await import("../../package.json", { with: { type: "json" } })).default;
    expect(sdk.VERSION).toBe(pkg.version);
  });
});
