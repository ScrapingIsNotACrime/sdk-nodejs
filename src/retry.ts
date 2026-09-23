export const MAX_RETRY_DELAY_MS = 10_000;
const BASE_DELAY_MS = 500;

function parseRetryAfter(value: string | null, now: () => number): number | undefined {
  if (value === null) return undefined;
  const trimmed = value.trim();
  if (/^\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed) * 1000;
  const date = Date.parse(trimmed);
  if (Number.isNaN(date)) return undefined;
  return Math.max(0, date - now());
}

export function retryDelayMs(
  attempt: number,
  retryAfter: string | null,
  random: () => number = Math.random,
  now: () => number = Date.now,
): number {
  const fromHeader = parseRetryAfter(retryAfter, now);
  const delay = fromHeader ?? Math.floor(random() * BASE_DELAY_MS * 2 ** attempt);
  return Math.min(delay, MAX_RETRY_DELAY_MS);
}
