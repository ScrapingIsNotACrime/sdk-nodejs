import { describe, expect, it } from "vitest";
import { clientReturning, expectSingle, fixture, pathArg, queryArgs } from "./harness.js";
import ltProfile from "../fixtures/lt-profile.json" with { type: "json" };
import twProfile from "../fixtures/tw-profile.json" with { type: "json" };
import twVideos from "../fixtures/tw-videos.json" with { type: "json" };
import ytVideos from "../fixtures/yt-channel-videos.json" with { type: "json" };
import ttProfile from "../fixtures/tt-profile.json" with { type: "json" };
import asSearch from "../fixtures/as-search.json" with { type: "json" };
import asReviews from "../fixtures/as-reviews.json" with { type: "json" };
import bsProfile from "../fixtures/bs-profile.json" with { type: "json" };
import bsPosts from "../fixtures/bs-posts.json" with { type: "json" };
import type { LinktreeProfile } from "../../src/types/linktree.js";
import type { TwitchProfile, TwitchVideos } from "../../src/types/twitch.js";
import type { YoutubeChannelVideos } from "../../src/types/youtube.js";
import type { TiktokProfile } from "../../src/types/tiktok.js";
import type { AppstoreReviewPage, AppstoreSearch } from "../../src/types/appstore.js";
import type { BlueskyPostPage, BlueskyProfile } from "../../src/types/bluesky.js";

// Compile-time gates: `tsc --noEmit` fails if a documented example doesn't fit its type.
export const gates: unknown[] = [
  ltProfile.response.data satisfies LinktreeProfile,
  twProfile.response.data satisfies TwitchProfile,
  twVideos.response.data satisfies TwitchVideos,
  ytVideos.response.data satisfies YoutubeChannelVideos,
  ttProfile.response.data satisfies TiktokProfile,
  asSearch.response.data satisfies AppstoreSearch,
  asReviews.response.data satisfies AppstoreReviewPage,
  bsProfile.response.data satisfies BlueskyProfile,
  bsPosts.response.data satisfies BlueskyPostPage,
];

describe("contract: small platforms", () => {
  it("linktree.profile", expectSingle("lt-profile", (c) => c.linktree.profile("linktree")));
  it("twitch.profile", expectSingle("tw-profile", (c) => c.twitch.profile(pathArg("tw-profile", 2))));
  it("twitch.videos", expectSingle("tw-videos", (c) =>
    c.twitch.videos(pathArg("tw-videos", 2), { limit: queryArgs("tw-videos").limit as number | undefined }),
  ));
  it("youtube.videos", expectSingle("yt-channel-videos", (c) => c.youtube.videos(pathArg("yt-channel-videos", 2))));
  it("tiktok.profile", expectSingle("tt-profile", (c) => c.tiktok.profile(pathArg("tt-profile", 2))));
  it("appstore.search", expectSingle("as-search", (c) => {
    const q = queryArgs("as-search");
    return c.appstore.search(String(q.term), { country: q.country as string | undefined, limit: q.limit as number | undefined });
  }));
  it("bluesky.profile", expectSingle("bs-profile", (c) => c.bluesky.profile(pathArg("bs-profile", 2))));

  it("tiktok.video", async () => {
    const { client, called } = clientReturning({ message: "ok", data: { id: "7300000000000000000" } });
    await expect(client.tiktok.video("7300000000000000000")).resolves.toEqual({ id: "7300000000000000000" });
    expect(called()).toEqual(["/tiktok/video/7300000000000000000"]);
  });

  it("appstore.reviews pages until the page-10 cap", async () => {
    const f = fixture<{ reviews: unknown[] }>("as-reviews");
    const q = queryArgs("as-reviews");
    const { client, called } = clientReturning(f.response);
    const page = await client.appstore.reviews(String(q.appId), { country: q.country as string, page: q.page as number });
    expect(page.items).toEqual(f.response.data.reviews);
    expect(page.hasMore).toBe(true);
    expect(page.nextPage).toBe(Number(q.page) + 1);
    expect(called()).toEqual([f.request]);
    const lastPage = await client.appstore.reviews(String(q.appId), { page: 10 });
    expect(lastPage.hasMore).toBe(false);
  });

  it("bluesky.posts follows next_cursor", async () => {
    const f = fixture<{ posts: unknown[]; next_cursor: string }>("bs-posts");
    const last = { message: "ok", data: { posts: [], next_cursor: null, has_more: false } };
    const { client, called } = clientReturning(f.response, last);
    const q = queryArgs("bs-posts");
    const page = await client.bluesky.posts(pathArg("bs-posts", 2), { limit: q.limit as number });
    expect(page.items).toEqual(f.response.data.posts);
    expect(page.nextCursor).toBe(f.response.data.next_cursor);
    const all: unknown[] = [];
    for await (const post of page) all.push(post);
    expect(all).toEqual(f.response.data.posts);
    expect(called()[0]).toBe(f.request);
    expect(called()[1]).toContain(`cursor=${encodeURIComponent(f.response.data.next_cursor)}`);
  });
});
