# ScrapingIsNotACrime Node.js SDK

[![npm version](https://img.shields.io/npm/v/@scrapingisnotacrime/sdk.svg)](https://www.npmjs.com/package/@scrapingisnotacrime/sdk)
[![license](https://img.shields.io/npm/l/@scrapingisnotacrime/sdk.svg)](./LICENSE)

Official Node.js/TypeScript SDK for the [ScrapingIsNotACrime](https://scrapingisnotacrime.com) public data API — typed access to Instagram, TikTok, YouTube, App Store, GitHub, Hacker News, Bluesky, Twitch and Linktree.

## Install

```bash
npm install @scrapingisnotacrime/sdk
```

Requires Node.js 22+.

## Quick start

```ts
import { ScrapingIsNotACrime } from "@scrapingisnotacrime/sdk";

const client = new ScrapingIsNotACrime({ apiKey: process.env.SCRAPINGISNOTACRIME_API_KEY });

const profile = await client.instagram.profile("nasa");
console.log(profile.username, profile.followers);
```

From CommonJS:

```js
const { ScrapingIsNotACrime } = require("@scrapingisnotacrime/sdk");
```

Get a key at [scrapingisnotacrime.com/dashboard/api-keys](https://scrapingisnotacrime.com/dashboard/api-keys). Keys start with `sinac_`.

## Configuration

```ts
new ScrapingIsNotACrime({
  apiKey: "sinac_...",
  baseUrl: "https://api.scrapingisnotacrime.com/v1",
  timeoutMs: 30_000,
  maxRetries: 2,
  fetch: customFetch,
});
```

| Option | Default | Description |
|---|---|---|
| `apiKey` | `SCRAPINGISNOTACRIME_API_KEY` env var | Your API key (`sinac_…`). Throws at construction if missing. |
| `baseUrl` | `https://api.scrapingisnotacrime.com/v1` | API base URL. |
| `timeoutMs` | `30000` | Per-attempt timeout, in milliseconds. |
| `maxRetries` | `2` | Extra attempts for 429, 502 and network errors. `0` disables retries. |
| `fetch` | global `fetch` | Custom `fetch` implementation, for tests or proxies. |

A custom `fetch` must honor `init.signal`: the SDK aborts that signal when `timeoutMs` elapses, and an implementation that ignores it cannot be interrupted, so the request waits for as long as your `fetch` does.

## Methods

Every method returns the response envelope's `data`, typed. Methods marked `→ Page` return a lazily-iterable `Page` (see [Pagination](#pagination)).

| Platform | Method | Route |
|---|---|---|
| Instagram | `instagram.profile(username)` | `/instagram/profile/{username}` |
| Instagram | `instagram.contact(username)` | `/instagram/profile/{username}/contact` |
| Instagram | `instagram.latestPosts(username)` | `/instagram/profile/{username}/timeline/latest` |
| Instagram | `instagram.posts(username, { count?, cursor? })` → `Page` | `/instagram/profile/{username}/timeline` |
| Instagram | `instagram.highlights(username)` | `/instagram/profile/{username}/highlights` |
| Instagram | `instagram.highlight(highlightId)` | `/instagram/highlights/{highlightId}` |
| Instagram | `instagram.mediaById(username, mediaId)` | `/instagram/profile/{username}/media/{mediaId}` |
| Instagram | `instagram.media(shortcode)` | `/instagram/media/{shortcode}` |
| Instagram | `instagram.download(shortcode)` | `/instagram/media/{shortcode}/download` |
| Instagram | `instagram.shortcodeToId(shortcode)` | `/instagram/media/{shortcode}/id` |
| Instagram | `instagram.idToShortcode(mediaId)` | `/instagram/media/id/{mediaId}` |
| Instagram | `instagram.reel(shortcode)` | `/instagram/reels/{shortcode}` |
| TikTok | `tiktok.profile(username)` | `/tiktok/profile/{username}` |
| TikTok | `tiktok.video(videoId)` | `/tiktok/video/{videoId}` |
| YouTube | `youtube.videos(handle)` | `/youtube/channel/{handle}/videos` |
| App Store | `appstore.search(term, { country?, limit? })` | `/appstore/search` |
| App Store | `appstore.reviews(appId, { country?, page? })` → `Page` | `/appstore/reviews` |
| GitHub | `github.profile(handle)` | `/github/profiles/{handle}` |
| GitHub | `github.followers(handle, { limit?, page? })` → `Page` | `/github/profiles/{handle}/followers` |
| GitHub | `github.following(handle, { limit?, page? })` → `Page` | `/github/profiles/{handle}/following` |
| GitHub | `github.repositories(handle, { limit?, page? })` → `Page` | `/github/profiles/{handle}/repositories` |
| GitHub | `github.searchRepositories(q, { limit?, page? })` → `Page` | `/github/repositories` |
| GitHub | `github.trending({ since?, language?, limit? })` | `/github/trending/repositories` |
| Hacker News | `hackernews.feed(feed, { limit?, page? })` → `Page` | `/hackernews/feeds/{feed}` |
| Hacker News | `hackernews.item(id)` | `/hackernews/items/{id}` |
| Hacker News | `hackernews.search(q, { limit?, page? })` → `Page` | `/hackernews/search` |
| Hacker News | `hackernews.user(username)` | `/hackernews/users/{username}` |
| Hacker News | `hackernews.submissions(username, { limit?, page? })` → `Page` | `/hackernews/users/{username}/submissions` |
| Hacker News | `hackernews.comments(username, { limit?, page? })` → `Page` | `/hackernews/users/{username}/comments` |
| Bluesky | `bluesky.profile(handle)` | `/bluesky/profiles/{handle}` |
| Bluesky | `bluesky.posts(handle, { limit?, cursor? })` → `Page` | `/bluesky/profiles/{handle}/posts` |
| Twitch | `twitch.profile(handle)` | `/twitch/profiles/{handle}` |
| Twitch | `twitch.videos(handle, { limit? })` | `/twitch/profiles/{handle}/videos` |
| Linktree | `linktree.profile(handle)` | `/linktree/profiles/{handle}` |

Path arguments are validated before any request: an empty string, `"."`, `".."` or a non-finite number (`NaN`, `Infinity`) throws a `TypeError`.

## Types

Every response type is exported, with field names exactly as the API sends them (snake_case). Fields the upstream platforms routinely leave empty — descriptions, bios, captions, languages, URLs of self-posts, last-broadcast info — are typed `field?: T | null`, so check them before use.

The option objects and unions are exported too, so you can name them in your own code:

| Type | Used by |
|---|---|
| `PageOptions` (`{ limit?, page? }`) | GitHub and Hacker News listings |
| `CursorPageOptions` (`{ limit?, cursor? }`) | `bluesky.posts` |
| `InstagramPostsOptions` (`{ count?, cursor? }`) | `instagram.posts` |
| `AppstoreSearchOptions` (`{ country?, limit? }`) | `appstore.search` |
| `AppstoreReviewsOptions` (`{ country?, page? }`) | `appstore.reviews` |
| `TwitchVideosOptions` (`{ limit? }`) | `twitch.videos` |
| `GithubTrendingOptions` (`{ since?, language?, limit? }`) | `github.trending` |
| `GithubTrendingSince` (`"daily" \| "weekly" \| "monthly"`) | `github.trending` |
| `HackernewsFeed` (`"top" \| "new" \| "best" \| "ask" \| "show" \| "job"`) | `hackernews.feed` |

Paginated responses follow `<Platform><Item>Page`: `InstagramTimelinePage`, `AppstoreReviewPage`, `GithubUserPage`, `GithubRepositoryPage`, `GithubRepositorySearchPage`, `HackernewsStoryPage`, `HackernewsUserCommentPage`, `BlueskyPostPage`.

`instagram.latestPosts` returns media typed `InstagramLatestPostImage | InstagramLatestPostVideo`. Narrow with the `in` operator to reach the video-only fields:

```ts
const { medias } = await client.instagram.latestPosts("nasa");
for (const media of medias) {
  if ("video_url" in media) console.log("video", media.video_url, media.video_views);
  else console.log("image", media.display_url);
}
```

## Pagination

Methods marked `→ Page` return a `Page<T, R>`, an `AsyncIterable<T>` (`Page` is exported as a type; instances only come from these methods):

```ts
interface Page<T, R> extends AsyncIterable<T> {
  items: T[];
  hasMore: boolean;
  nextCursor?: string; // cursor endpoints
  nextPage?: number;   // page endpoints
  data: R;              // the full response of this page
}
```

Iterate every item, fetching further pages lazily as they're needed:

```ts
const page = await client.github.followers("torvalds", { limit: 100 });
for await (const user of page) {
  console.log(user.username);
}
```

`page.data` gives you the untouched response of the current page, so fields such as `total` stay reachable. Breaking out of the loop early stops fetching — no further pages are requested once you `break`.

## Errors

Every failure throws a subclass of `ScrapingIsNotACrimeError`, carrying `status` (the HTTP status, or `undefined` for network errors), `message` and `requestId` (when the API returns one).

| Class | Status | Retried |
|---|---|---|
| `BadRequestError` | 400 | no |
| `AuthenticationError` | 401 | no |
| `QuotaExceededError` | 402 | no |
| `NotFoundError` | 404 | no |
| `RateLimitError` | 429 | yes |
| `UpstreamError` | 502 | yes |
| `ConnectionError` | network failure or timeout | yes |
| `APIError` | any other non-2xx | no |

```ts
import { NotFoundError, QuotaExceededError, RateLimitError, ScrapingIsNotACrime } from "@scrapingisnotacrime/sdk";

const client = new ScrapingIsNotACrime({ maxRetries: 3 });

try {
  await client.tiktok.profile("this-user-does-not-exist-123");
} catch (error) {
  if (error instanceof NotFoundError) console.log("No such profile.");
  else if (error instanceof QuotaExceededError) console.log("Out of credits:", error.message);
  else if (error instanceof RateLimitError) console.log("TikTok is rate limiting; try again later.");
  else throw error;
}
```

### Mixing `import` and `require`

The package ships an ESM build and a CommonJS build. If one application loads both (for example, your code uses `import` while a dependency uses `require`), there are two copies of every error class, and an error thrown by one copy is not `instanceof` the other's classes. Stick to one module system, or check `error.name` (e.g. `"NotFoundError"`) or `error.status` instead of `instanceof`.

## Retries

`RateLimitError` (429), `UpstreamError` (502) and `ConnectionError` (network failure or timeout) are retried automatically, up to `maxRetries` additional attempts (default 2). These failures don't consume credits, so retrying them costs you nothing.

The delay before each retry uses the `Retry-After` header when the API sends one (seconds or an HTTP date); otherwise it's exponential backoff with full jitter, starting at 500 ms and doubling per attempt. Every wait is capped at 10 seconds. Set `maxRetries: 0` to disable retries entirely.

## Do not use in the browser

Calling this SDK directly from a browser exposes your API key to anyone who opens the network tab. Call it from your server, and proxy any client-facing requests through your own backend.

## Links

- Docs: https://scrapingisnotacrime.com/docs
- Pricing: https://scrapingisnotacrime.com/#pricing
- License: [MIT](./LICENSE)
