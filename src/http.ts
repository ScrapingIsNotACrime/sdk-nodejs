import type { ResolvedConfig } from "./config.js";
import { APIError, ConnectionError, errorFromStatus, isRetryable, type ScrapingIsNotACrimeError } from "./errors.js";
import { retryDelayMs } from "./retry.js";
import { VERSION } from "./version.js";

export type Query = Record<string, string | number | undefined>;

interface Internals {
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Encodes one path segment; rejects values that would drop or climb a path level. */
export function segment(value: string | number): string {
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new TypeError(`Invalid path segment: ${value} is not a finite number.`);
  }
  const text = String(value);
  if (text === "" || text === "." || text === "..") {
    throw new TypeError(`Invalid path segment: ${JSON.stringify(text)}.`);
  }
  return encodeURIComponent(text);
}

/** Rejects with the signal's reason once it aborts; never resolves. */
function abortedBy(signal: AbortSignal): Promise<never> {
  return new Promise((_resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  });
}

function snippet(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > 200 ? `${flat.slice(0, 200)}…` : flat;
}

export class HttpClient {
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly random: () => number;

  constructor(
    private readonly config: ResolvedConfig,
    internals: Internals = {},
  ) {
    this.sleep = internals.sleep ?? defaultSleep;
    this.random = internals.random ?? Math.random;
  }

  async get<T>(path: string, query: Query = {}): Promise<T> {
    const url = this.buildUrl(path, query);
    for (let attempt = 0; ; attempt++) {
      const result = await this.attempt<T>(url);
      if (result.ok) return result.data;
      if (attempt >= this.config.maxRetries || !isRetryable(result.error)) throw result.error;
      await this.sleep(retryDelayMs(attempt, result.retryAfter, this.random));
    }
  }

  private buildUrl(path: string, query: Query): string {
    const url = new URL(`${this.config.baseUrl}${path}`);
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  private async fetchText(
    url: string,
    controller: AbortController,
  ): Promise<{ ok: true; response: Response; text: string } | { ok: false; error: ConnectionError }> {
    try {
      const request = (async () => {
        const response = await this.config.fetch(url, {
          method: "GET",
          headers: {
            "X-Api-Key": this.config.apiKey,
            Accept: "application/json",
            "User-Agent": `scrapingisnotacrime-node/${VERSION}`,
          },
          signal: controller.signal,
        });
        return { response, text: await response.text() };
      })();
      // A custom fetch (or its body stream) may ignore the signal; racing
      // against the abort guarantees timeoutMs is honored regardless.
      const { response, text } = await Promise.race([request, abortedBy(controller.signal)]);
      return { ok: true, response, text };
    } catch (cause) {
      const message = controller.signal.aborted
        ? `Request timed out after ${this.config.timeoutMs} ms`
        : `Network error: ${cause instanceof Error ? cause.message : String(cause)}`;
      return { ok: false, error: new ConnectionError(message, { cause }) };
    }
  }

  private async attempt<T>(
    url: string,
  ): Promise<{ ok: true; data: T } | { ok: false; error: ScrapingIsNotACrimeError; retryAfter: string | null }> {
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(new Error(`Request timed out after ${this.config.timeoutMs} ms`)),
      this.config.timeoutMs,
    );
    let fetched: { ok: true; response: Response; text: string } | { ok: false; error: ConnectionError };
    try {
      fetched = await this.fetchText(url, controller);
    } finally {
      clearTimeout(timer);
    }

    if (!fetched.ok) return { ok: false, error: fetched.error, retryAfter: null };
    const { response, text } = fetched;

    const requestId = response.headers.get("x-request-id") ?? undefined;
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : undefined;
    } catch {
      body = undefined;
    }
    const envelope = body !== null && typeof body === "object" ? (body as { message?: unknown; data?: unknown }) : undefined;

    if (response.ok) {
      if (envelope && "data" in envelope) return { ok: true, data: envelope.data as T };
      return {
        ok: false,
        error: new APIError(`Unexpected response body (HTTP ${response.status}): ${snippet(text)}`, {
          status: response.status,
          ...(requestId ? { requestId } : {}),
        }),
        retryAfter: null,
      };
    }

    const message =
      typeof envelope?.message === "string" ? envelope.message : `HTTP ${response.status}: ${snippet(text)}`;
    return {
      ok: false,
      error: errorFromStatus(response.status, message, requestId),
      retryAfter: response.headers.get("retry-after"),
    };
  }
}
