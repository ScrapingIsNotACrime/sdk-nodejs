/** Options for 1-based (GitHub) and 0-based (Hacker News) numbered listings. */
export interface PageOptions {
  /** Items per page; the accepted range depends on the endpoint. */
  limit?: number;
  /** Page to start from; GitHub counts from 1, Hacker News from 0. */
  page?: number;
}

/** Options for cursor-paginated Bluesky listings. */
export interface CursorPageOptions {
  /** Items per page, 1–100 (default 25). */
  limit?: number;
  /** `nextCursor` of a previous page, to resume from there. */
  cursor?: string;
}

/** Options for `instagram.posts`. */
export interface InstagramPostsOptions {
  /** Posts per page, 1–50 (default 12). */
  count?: number;
  /** `nextCursor` of a previous page, to resume from there. */
  cursor?: string;
}

/** Options for `appstore.search`. */
export interface AppstoreSearchOptions {
  /** Two-letter store country (default "us"). */
  country?: string;
  /** Results, 1–200 (default 10). */
  limit?: number;
}

/** Options for `appstore.reviews`. */
export interface AppstoreReviewsOptions {
  /** Two-letter store country (default "us"). */
  country?: string;
  /** Page 1–10 (Apple's cap). */
  page?: number;
}

/** Options for `twitch.videos`. */
export interface TwitchVideosOptions {
  /** Videos, 1–100 (default 20). */
  limit?: number;
}

/** Trending window for `github.trending`. */
export type GithubTrendingSince = "daily" | "weekly" | "monthly";

/** Options for `github.trending`. */
export interface GithubTrendingOptions {
  /** Defaults to "daily". */
  since?: GithubTrendingSince;
  /** Language filter, e.g. "php". */
  language?: string;
  /** Repositories, 1–100 (default 30). */
  limit?: number;
}

/** Hacker News feeds accepted by `hackernews.feed`. */
export type HackernewsFeed = "top" | "new" | "best" | "ask" | "show" | "job";
