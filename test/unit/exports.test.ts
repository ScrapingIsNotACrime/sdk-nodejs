import { describe, expect, it } from "vitest";
import * as sdk from "../../src/index.js";

describe("public exports", () => {
  it("exports the client, errors and VERSION", () => {
    for (const name of [
      "ScrapingIsNotACrime",
      "ScrapingIsNotACrimeError",
      "BadRequestError",
      "AuthenticationError",
      "QuotaExceededError",
      "NotFoundError",
      "RateLimitError",
      "UpstreamError",
      "ConnectionError",
      "APIError",
      "VERSION",
    ]) {
      expect(sdk, name).toHaveProperty(name);
    }
    expect(sdk.default).toBe(sdk.ScrapingIsNotACrime);
  });

  it("exports Page as a type only (instances come from paginated methods)", () => {
    expect(sdk).not.toHaveProperty("Page");
  });

  it("keeps VERSION in sync with package.json", async () => {
    const pkg = (await import("../../package.json", { with: { type: "json" } })).default;
    expect(sdk.VERSION).toBe(pkg.version);
  });
});

// Compile-time: the option and page types users need to name are public (checked by `tsc --noEmit`).
export const publicTypes = {
  since: "weekly" satisfies sdk.GithubTrendingSince,
  feed: "top" satisfies sdk.HackernewsFeed,
  page: { limit: 10, page: 2 } satisfies sdk.PageOptions,
  cursor: { limit: 25, cursor: "c" } satisfies sdk.CursorPageOptions,
  instagram: { count: 12, cursor: "c" } satisfies sdk.InstagramPostsOptions,
  appstoreSearch: { country: "us", limit: 5 } satisfies sdk.AppstoreSearchOptions,
  appstoreReviews: { country: "us", page: 1 } satisfies sdk.AppstoreReviewsOptions,
  twitch: { limit: 5 } satisfies sdk.TwitchVideosOptions,
  trending: { since: "daily", language: "php", limit: 1 } satisfies sdk.GithubTrendingOptions,
  pages: [] as unknown as [
    sdk.BlueskyPostPage,
    sdk.AppstoreReviewPage,
    sdk.GithubUserPage,
    sdk.GithubRepositoryPage,
    sdk.GithubRepositorySearchPage,
    sdk.HackernewsStoryPage,
    sdk.HackernewsUserCommentPage,
    sdk.InstagramTimelinePage,
    sdk.Page<sdk.HackernewsUserComment, sdk.HackernewsUserCommentPage>,
  ],
};
