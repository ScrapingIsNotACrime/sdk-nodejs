import { describe, expect, it, vi } from "vitest";
import { resolveConfig } from "../../src/config.js";
import {
  APIError,
  AuthenticationError,
  ConnectionError,
  NotFoundError,
  RateLimitError,
  UpstreamError,
} from "../../src/errors.js";
import { HttpClient, segment } from "../../src/http.js";
import { VERSION } from "../../src/version.js";

type Reply = { status: number; body: unknown; headers?: Record<string, string> } | Error;

function setup(replies: Reply[], options: { maxRetries?: number; timeoutMs?: number; baseUrl?: string } = {}) {
  const requests: Request[] = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    requests.push(new Request(input, init));
    const reply = replies.shift();
    if (!reply) throw new Error("no more replies");
    if (reply instanceof Error) throw reply;
    const text = typeof reply.body === "string" ? reply.body : JSON.stringify(reply.body);
    return new Response(text, { status: reply.status, headers: reply.headers });
  });
  const sleep = vi.fn(async () => {});
  const config = resolveConfig({ apiKey: "sinac_test", fetch: fetchMock as typeof fetch, ...options }, {});
  const http = new HttpClient(config, { sleep, random: () => 0.5 });
  return { http, requests, fetchMock, sleep };
}

const ok = (data: unknown) => ({ status: 200, body: { message: "ok", data } });

describe("HttpClient.get", () => {
  it("sends the API key, JSON accept and SDK user agent, and unwraps data", async () => {
    const { http, requests } = setup([ok({ a: 1 })]);
    await expect(http.get("/linktree/profiles/x")).resolves.toEqual({ a: 1 });
    const request = requests[0]!;
    expect(request.method).toBe("GET");
    expect(request.url).toBe("https://api.scrapingisnotacrime.com/v1/linktree/profiles/x");
    expect(request.headers.get("x-api-key")).toBe("sinac_test");
    expect(request.headers.get("accept")).toBe("application/json");
    expect(request.headers.get("user-agent")).toBe(`scrapingisnotacrime-node/${VERSION}`);
  });

  it("builds the query string and skips undefined values", async () => {
    const { http, requests } = setup([ok([])]);
    await http.get("/github/repositories", { q: "stars:>10 language:php", limit: 5, page: undefined });
    expect(requests[0]!.url).toBe(
      "https://api.scrapingisnotacrime.com/v1/github/repositories?q=stars%3A%3E10+language%3Aphp&limit=5",
    );
  });

  it("normalizes a trailing slash in baseUrl", async () => {
    const { http, requests } = setup([ok(1)], { baseUrl: "https://example.test/v1/" });
    await http.get("/x");
    expect(requests[0]!.url).toBe("https://example.test/v1/x");
  });

  it("encodes path segments", () => {
    expect(segment("a/b")).toBe("a%2Fb");
    expect(segment("josé#1")).toBe("jos%C3%A9%231");
    expect(segment(8863)).toBe("8863");
  });

  it("maps error statuses and keeps the API message and request id", async () => {
    const { http } = setup([{ status: 404, body: { message: "Profile not found." }, headers: { "x-request-id": "r-9" } }]);
    const error = await http.get("/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error).toMatchObject({ status: 404, message: "Profile not found.", requestId: "r-9" });
  });

  it("does not retry 400/401/402/404", async () => {
    for (const status of [400, 401, 402, 404]) {
      const { http, fetchMock } = setup([{ status, body: { message: "no" } }, ok(1)]);
      await expect(http.get("/x")).rejects.toThrow();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    }
    const { http } = setup([{ status: 401, body: { message: "Invalid API key." } }]);
    await expect(http.get("/x")).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("retries 429 and 502 up to maxRetries, then throws the last error", async () => {
    const { http, fetchMock, sleep } = setup([
      { status: 429, body: { message: "Instagram rate limit reached." } },
      { status: 502, body: { message: "Upstream failed." } },
      { status: 429, body: { message: "Instagram rate limit reached." } },
    ]);
    await expect(http.get("/x")).rejects.toBeInstanceOf(RateLimitError);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenNthCalledWith(1, 250);
    expect(sleep).toHaveBeenNthCalledWith(2, 500);
  });

  it("succeeds after a retried failure", async () => {
    const { http, fetchMock } = setup([{ status: 502, body: { message: "x" } }, ok("done")]);
    await expect(http.get("/x")).resolves.toBe("done");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("honors Retry-After", async () => {
    const { http, sleep } = setup([{ status: 429, body: { message: "x" }, headers: { "retry-after": "2" } }, ok(1)]);
    await http.get("/x");
    expect(sleep).toHaveBeenCalledWith(2000);
  });

  it("disables retries with maxRetries 0", async () => {
    const { http, fetchMock } = setup([{ status: 502, body: { message: "x" } }, ok(1)], { maxRetries: 0 });
    await expect(http.get("/x")).rejects.toBeInstanceOf(UpstreamError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("wraps network failures in ConnectionError and retries them", async () => {
    const { http, fetchMock } = setup([new TypeError("fetch failed"), ok(1)]);
    await expect(http.get("/x")).resolves.toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const { http: failing } = setup([new TypeError("a"), new TypeError("b"), new TypeError("c")]);
    const error = await failing.get("/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ConnectionError);
    expect((error as ConnectionError).status).toBeUndefined();
  });

  it("times out an attempt as ConnectionError", async () => {
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
        }),
    );
    const config = resolveConfig(
      { apiKey: "sinac_test", fetch: fetchMock as typeof fetch, timeoutMs: 20, maxRetries: 0 },
      {},
    );
    const http = new HttpClient(config, { sleep: async () => {} });
    const error = await http.get("/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ConnectionError);
    expect((error as Error).message).toMatch(/timed out after 20 ms/);
  });

  it("throws APIError for a 2xx body without an envelope", async () => {
    const { http } = setup([{ status: 200, body: "<html>proxy</html>" }]);
    await expect(http.get("/x")).rejects.toBeInstanceOf(APIError);
    const { http: noData } = setup([{ status: 200, body: { message: "ok" } }]);
    await expect(noData.get("/x")).rejects.toBeInstanceOf(APIError);
  });

  it("uses a generic message for an error body that is not JSON", async () => {
    const { http } = setup([{ status: 500, body: "Internal Server Error" }]);
    const error = await http.get("/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(APIError);
    expect((error as Error).message).toBe("HTTP 500: Internal Server Error");
  });
});
