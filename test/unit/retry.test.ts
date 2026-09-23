import { describe, expect, it } from "vitest";
import { MAX_RETRY_DELAY_MS, retryDelayMs } from "../../src/retry.js";

describe("retryDelayMs", () => {
  it("uses full jitter over 500ms * 2^attempt", () => {
    expect(retryDelayMs(0, null, () => 0.5)).toBe(250);
    expect(retryDelayMs(1, null, () => 0.5)).toBe(500);
    expect(retryDelayMs(2, null, () => 0.999)).toBeLessThan(2000);
  });

  it("honors Retry-After in seconds", () => {
    expect(retryDelayMs(0, "3", () => 0)).toBe(3000);
  });

  it("honors Retry-After as an HTTP date", () => {
    const now = Date.parse("2026-09-23T10:00:00Z");
    expect(retryDelayMs(0, "Wed, 23 Sep 2026 10:00:04 GMT", () => 0, () => now)).toBe(4000);
  });

  it("caps Retry-After at 10 seconds", () => {
    expect(retryDelayMs(0, "3600", () => 0)).toBe(MAX_RETRY_DELAY_MS);
    const now = Date.parse("2026-09-23T10:00:00Z");
    expect(retryDelayMs(0, "Thu, 24 Sep 2026 10:00:00 GMT", () => 0, () => now)).toBe(MAX_RETRY_DELAY_MS);
  });

  it("caps exponential backoff at 10 seconds", () => {
    expect(retryDelayMs(10, null, () => 0.999)).toBeLessThanOrEqual(MAX_RETRY_DELAY_MS);
  });

  it("falls back to backoff for an unparseable or past Retry-After", () => {
    expect(retryDelayMs(0, "soon", () => 0.5)).toBe(250);
    const now = Date.parse("2026-09-23T10:00:00Z");
    expect(retryDelayMs(0, "Wed, 23 Sep 2026 09:00:00 GMT", () => 0.5, () => now)).toBe(0);
  });
});
