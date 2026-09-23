import { describe, expect, it } from "vitest";
import {
  APIError,
  AuthenticationError,
  BadRequestError,
  ConnectionError,
  NotFoundError,
  QuotaExceededError,
  RateLimitError,
  ScrapingIsNotACrimeError,
  UpstreamError,
  errorFromStatus,
  isRetryable,
} from "../../src/errors.js";

describe("errorFromStatus", () => {
  it.each([
    [400, BadRequestError],
    [401, AuthenticationError],
    [402, QuotaExceededError],
    [404, NotFoundError],
    [429, RateLimitError],
    [502, UpstreamError],
    [500, APIError],
    [418, APIError],
  ])("maps %i to %o", (status, cls) => {
    const error = errorFromStatus(status, "boom", "req-1");
    expect(error).toBeInstanceOf(cls);
    expect(error).toBeInstanceOf(ScrapingIsNotACrimeError);
    expect(error.status).toBe(status);
    expect(error.requestId).toBe("req-1");
    expect(error.name).toBe(cls.name);
  });

  it("keeps the API message and points 402 to the pricing page", () => {
    expect(errorFromStatus(404, "Profile not found.").message).toBe("Profile not found.");
    expect(errorFromStatus(402, "plan.quota_exceeded").message).toBe(
      "plan.quota_exceeded — see https://scrapingisnotacrime.com/#pricing",
    );
  });
});

describe("isRetryable", () => {
  it("retries only rate limits, upstream failures and connection errors", () => {
    expect(isRetryable(new RateLimitError("x", { status: 429 }))).toBe(true);
    expect(isRetryable(new UpstreamError("x", { status: 502 }))).toBe(true);
    expect(isRetryable(new ConnectionError("x"))).toBe(true);
    for (const status of [400, 401, 402, 404, 500]) {
      expect(isRetryable(errorFromStatus(status, "x"))).toBe(false);
    }
    expect(isRetryable(new Error("x"))).toBe(false);
  });
});
