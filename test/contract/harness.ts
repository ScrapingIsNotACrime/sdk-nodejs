import { readFileSync } from "node:fs";
import { expect, vi } from "vitest";
import { ScrapingIsNotACrime } from "../../src/client.js";

export interface Fixture<D = unknown> {
  request: string;
  response: { message: string; data: D };
}

/** Path + query with the query re-serialized by URLSearchParams, so encodings compare equal. */
export function normalizeRequest(request: string): string {
  const [path, query] = request.split("?");
  const params = new URLSearchParams(query ?? "").toString();
  return params ? `${path}?${params}` : path!;
}

/** A fixture with its `request` already normalized. */
export function fixture<D = unknown>(id: string): Fixture<D> {
  const raw = JSON.parse(readFileSync(new URL(`../fixtures/${id}.json`, import.meta.url), "utf8")) as Fixture<D>;
  return { ...raw, request: normalizeRequest(raw.request) };
}

/** A client whose fetch answers every call with the given envelopes, in order (the last one repeats). */
export function clientReturning(...bodies: unknown[]) {
  const urls: URL[] = [];
  const fetch = vi.fn(async (input: RequestInfo | URL) => {
    urls.push(new URL(String(input instanceof Request ? input.url : input)));
    const body = bodies.length > 1 ? bodies.shift() : bodies[0];
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
  });
  const client = new ScrapingIsNotACrime({ apiKey: "sinac_test", fetch: fetch as typeof globalThis.fetch, maxRetries: 0 });
  /** Path + query after /v1, e.g. "/linktree/profiles/linktree". */
  const called = () => urls.map((u) => normalizeRequest(`${u.pathname.replace(/^\/v1/, "")}${u.search}`));
  return { client, called, fetch };
}

/** Runs one contract test: calls `call` and expects it to resolve with the fixture's data, hitting the fixture's request. */
export function expectSingle(id: string, call: (c: ScrapingIsNotACrime) => Promise<unknown>) {
  return async () => {
    const f = fixture(id);
    const { client, called } = clientReturning(f.response);
    await expect(call(client)).resolves.toEqual(f.response.data);
    expect(called()).toEqual([f.request]);
  };
}

/** The n-th path segment of a fixture's request (0 = platform), decoded. */
export function pathArg(id: string, n: number): string {
  const path = fixture(id).request.split("?")[0]!;
  return decodeURIComponent(path.split("/").filter(Boolean)[n]!);
}

/** A fixture request's query as a record, numbers parsed. */
export function queryArgs(id: string): Record<string, string | number> {
  const search = fixture(id).request.split("?")[1] ?? "";
  const out: Record<string, string | number> = {};
  for (const [k, v] of new URLSearchParams(search)) out[k] = /^\d+$/.test(v) && k !== "appId" && k !== "term" ? Number(v) : v;
  return out;
}
