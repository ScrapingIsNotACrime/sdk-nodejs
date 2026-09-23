export interface ErrorOptions {
  status?: number;
  requestId?: string;
  cause?: unknown;
}

export class ScrapingIsNotACrimeError extends Error {
  readonly status: number | undefined;
  readonly requestId: string | undefined;

  constructor(message: string, options: ErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = new.target.name;
    this.status = options.status;
    this.requestId = options.requestId;
  }
}

export class BadRequestError extends ScrapingIsNotACrimeError {}
export class AuthenticationError extends ScrapingIsNotACrimeError {}
export class QuotaExceededError extends ScrapingIsNotACrimeError {}
export class NotFoundError extends ScrapingIsNotACrimeError {}
export class RateLimitError extends ScrapingIsNotACrimeError {}
export class UpstreamError extends ScrapingIsNotACrimeError {}
export class ConnectionError extends ScrapingIsNotACrimeError {}
export class APIError extends ScrapingIsNotACrimeError {}

const PRICING_URL = "https://scrapingisnotacrime.com/#pricing";

export function errorFromStatus(status: number, message: string, requestId?: string): ScrapingIsNotACrimeError {
  const options: ErrorOptions = { status, ...(requestId ? { requestId } : {}) };
  switch (status) {
    case 400:
      return new BadRequestError(message, options);
    case 401:
      return new AuthenticationError(message, options);
    case 402:
      return new QuotaExceededError(`${message} — see ${PRICING_URL}`, options);
    case 404:
      return new NotFoundError(message, options);
    case 429:
      return new RateLimitError(message, options);
    case 502:
      return new UpstreamError(message, options);
    default:
      return new APIError(message, options);
  }
}

// 429 and 502 don't consume credits, so retrying them costs the customer nothing.
export function isRetryable(error: unknown): boolean {
  return error instanceof RateLimitError || error instanceof UpstreamError || error instanceof ConnectionError;
}
