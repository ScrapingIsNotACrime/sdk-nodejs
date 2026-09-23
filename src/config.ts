export const DEFAULT_BASE_URL = "https://api.scrapingisnotacrime.com/v1";
export const API_KEY_ENV = "SCRAPINGISNOTACRIME_API_KEY";

export interface ClientOptions {
  /** Your API key (`sinac_…`). Defaults to the SCRAPINGISNOTACRIME_API_KEY environment variable. */
  apiKey?: string;
  /** Defaults to https://api.scrapingisnotacrime.com/v1 */
  baseUrl?: string;
  /** Per-attempt timeout in milliseconds. Defaults to 30000. */
  timeoutMs?: number;
  /** Extra attempts for 429, 502 and network errors. Defaults to 2; 0 disables retries. */
  maxRetries?: number;
  /** Custom fetch implementation (tests, proxies). Defaults to the global fetch. */
  fetch?: typeof fetch;
}

export interface ResolvedConfig {
  apiKey: string;
  baseUrl: string;
  timeoutMs: number;
  maxRetries: number;
  fetch: typeof fetch;
}

export function resolveConfig(
  options: ClientOptions = {},
  env: Record<string, string | undefined> = globalThis.process?.env ?? {},
): ResolvedConfig {
  const apiKey = (options.apiKey ?? env[API_KEY_ENV] ?? "").trim();
  if (!apiKey) {
    throw new Error(`Missing API key: pass { apiKey } or set the ${API_KEY_ENV} environment variable.`);
  }

  const timeoutMs = options.timeoutMs ?? 30_000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error("timeoutMs must be a positive number.");

  const maxRetries = options.maxRetries ?? 2;
  if (!Number.isInteger(maxRetries) || maxRetries < 0) throw new Error("maxRetries must be a non-negative integer.");

  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") throw new Error("No fetch implementation available; pass { fetch }.");

  return {
    apiKey,
    baseUrl: (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, ""),
    timeoutMs,
    maxRetries,
    fetch: fetchImpl,
  };
}
