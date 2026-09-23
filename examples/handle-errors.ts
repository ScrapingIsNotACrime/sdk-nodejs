import { NotFoundError, QuotaExceededError, RateLimitError, ScrapingIsNotACrime } from "../src/index.js";

const client = new ScrapingIsNotACrime({ maxRetries: 3 });

try {
  await client.tiktok.profile("this-user-does-not-exist-123");
} catch (error) {
  if (error instanceof NotFoundError) console.log("No such profile.");
  else if (error instanceof QuotaExceededError) console.log("Out of credits:", error.message);
  else if (error instanceof RateLimitError) console.log("TikTok is rate limiting; try again later.");
  else throw error;
}
