import { describe, expect, it } from "vitest";
import { clientReturning, expectSingle, fixture, pathArg, queryArgs } from "./harness.js";
import ghProfile from "../fixtures/gh-profile.json" with { type: "json" };
import ghFollowers from "../fixtures/gh-followers.json" with { type: "json" };
import ghRepos from "../fixtures/gh-repos.json" with { type: "json" };
import ghSearchRepos from "../fixtures/gh-search-repos.json" with { type: "json" };
import ghTrending from "../fixtures/gh-trending.json" with { type: "json" };
import hnFeed from "../fixtures/hn-feed.json" with { type: "json" };
import hnItem from "../fixtures/hn-item.json" with { type: "json" };
import hnSearch from "../fixtures/hn-search.json" with { type: "json" };
import hnUser from "../fixtures/hn-user.json" with { type: "json" };
import hnUserSubmissions from "../fixtures/hn-user-submissions.json" with { type: "json" };
import type {
  GithubProfile,
  GithubRepositoryPage,
  GithubRepositorySearch,
  GithubTrending,
  GithubUserPage,
} from "../../src/types/github.js";
import type {
  HackernewsItem,
  HackernewsStoryPage,
  HackernewsUser,
} from "../../src/types/hackernews.js";

// Compile-time gates: `tsc --noEmit` fails if a documented example doesn't fit its type.
export const gates: unknown[] = [
  ghProfile.response.data satisfies GithubProfile,
  ghFollowers.response.data satisfies GithubUserPage,
  ghRepos.response.data satisfies GithubRepositoryPage,
  ghSearchRepos.response.data satisfies GithubRepositorySearch,
  ghTrending.response.data satisfies GithubTrending,
  hnFeed.response.data satisfies HackernewsStoryPage,
  hnItem.response.data satisfies HackernewsItem,
  hnSearch.response.data satisfies HackernewsStoryPage,
  hnUser.response.data satisfies HackernewsUser,
  hnUserSubmissions.response.data satisfies HackernewsStoryPage,
];

describe("contract: github", () => {
  it("github.profile", expectSingle("gh-profile", (c) => c.github.profile(pathArg("gh-profile", 2))));

  it("github.followers paginates 1-based via has_more", async () => {
    const f = fixture<{ items: unknown[]; has_more: boolean }>("gh-followers");
    const end = { message: "ok", data: { items: [], total: null, has_more: false } };
    const { client, called } = clientReturning(f.response, end);
    const q = queryArgs("gh-followers");
    const page = await client.github.followers(pathArg("gh-followers", 2), { limit: q.limit as number | undefined, page: q.page as number | undefined });
    expect(page.items).toEqual(f.response.data.items);
    expect(page.hasMore).toBe(true);
    expect(page.nextPage).toBe(((q.page as number | undefined) ?? 1) + 1);
    expect(called()).toEqual([f.request]);
    const all: unknown[] = [];
    for await (const u of page) all.push(u);
    expect(all).toEqual(f.response.data.items);
    expect(called()[1]).toContain(`page=${((q.page as number | undefined) ?? 1) + 1}`);
  });

  it("github.following uses the followers shape", async () => {
    const f = fixture("gh-followers");
    const { client, called } = clientReturning(f.response);
    const page = await client.github.following("torvalds", { limit: 5, page: 2 });
    expect(page.data).toEqual(f.response.data);
    expect(called()).toEqual(["/github/profiles/torvalds/following?limit=5&page=2"]);
  });

  it("github.repositories", async () => {
    const f = fixture<{ items: unknown[] }>("gh-repos");
    const { client, called } = clientReturning(f.response);
    const q = queryArgs("gh-repos");
    const page = await client.github.repositories(pathArg("gh-repos", 2), { limit: q.limit as number | undefined, page: q.page as number | undefined });
    expect(page.items).toEqual(f.response.data.items);
    // The gh-repos fixture request omits `page`; github.repositories always sends it (default 1).
    expect(called()).toEqual([`${f.request}&page=1`]);
  });

  it("github.searchRepositories", async () => {
    const f = fixture<{ items: unknown[] }>("gh-search-repos");
    const { client, called } = clientReturning(f.response);
    const q = queryArgs("gh-search-repos");
    const page = await client.github.searchRepositories(String(q.q), { limit: q.limit as number | undefined, page: q.page as number | undefined });
    expect(page.items).toEqual(f.response.data.items);
    // The gh-search-repos fixture request omits `page`; searchRepositories always sends it (default 1).
    expect(called()).toEqual([`${f.request}&page=1`]);
  });

  it("github.trending", expectSingle("gh-trending", (c) => {
    const q = queryArgs("gh-trending");
    return c.github.trending({ since: q.since as "daily" | undefined, language: q.language as string | undefined, limit: q.limit as number | undefined });
  }));
});

describe("contract: hackernews", () => {
  it("hackernews.feed paginates 0-based", async () => {
    const f = fixture<{ items: unknown[] }>("hn-feed");
    const { client, called } = clientReturning(f.response);
    const q = queryArgs("hn-feed");
    const page = await client.hackernews.feed(pathArg("hn-feed", 2) as "top", { limit: q.limit as number, page: q.page as number });
    expect(page.items).toEqual(f.response.data.items);
    expect(page.nextPage).toBe((q.page as number) + 1);
    expect(called()).toEqual([f.request]);
    const first = await client.hackernews.feed("new");
    expect(first.nextPage).toBe(1);
    expect(called()[1]).toBe("/hackernews/feeds/new?page=0");
  });

  it("hackernews.item", expectSingle("hn-item", (c) => c.hackernews.item(Number(pathArg("hn-item", 2)))));

  it("hackernews.search", async () => {
    const f = fixture<{ items: unknown[] }>("hn-search");
    const { client, called } = clientReturning(f.response);
    const q = queryArgs("hn-search");
    const page = await client.hackernews.search(String(q.q), { limit: q.limit as number | undefined, page: q.page as number | undefined });
    expect(page.items).toEqual(f.response.data.items);
    expect(called()).toEqual([f.request]);
  });

  it("hackernews.user", expectSingle("hn-user", (c) => c.hackernews.user(pathArg("hn-user", 2))));

  it("hackernews.submissions", async () => {
    const f = fixture<{ items: unknown[] }>("hn-user-submissions");
    const { client, called } = clientReturning(f.response);
    const q = queryArgs("hn-user-submissions");
    const page = await client.hackernews.submissions(pathArg("hn-user-submissions", 2), { limit: q.limit as number | undefined, page: q.page as number | undefined });
    expect(page.items).toEqual(f.response.data.items);
    expect(called()).toEqual([f.request]);
  });

  it("hackernews.comments", async () => {
    const data = { items: [], total: 0, page: 0, has_more: false };
    const { client, called } = clientReturning({ message: "ok", data });
    const page = await client.hackernews.comments("pg", { limit: 10 });
    expect(page.data).toEqual(data);
    expect(page.hasMore).toBe(false);
    expect(called()).toEqual(["/hackernews/users/pg/comments?limit=10&page=0"]);
  });
});
