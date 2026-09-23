import { describe, expect, it, vi } from "vitest";
import { ScrapingIsNotACrime } from "../../src/client.js";

// A bad path argument must surface as a rejected Promise, never as a
// synchronous throw: callers rely on `.catch()` and `Promise.all`.
describe("invalid path arguments", () => {
  const fetch = vi.fn(async () => new Response("{}"));
  const client = new ScrapingIsNotACrime({ apiKey: "sinac_test", fetch: fetch as typeof globalThis.fetch });

  const calls: Array<[string, () => Promise<unknown>]> = [
    ["instagram.profile", () => client.instagram.profile("")],
    ["instagram.contact", () => client.instagram.contact("..")],
    ["instagram.latestPosts", () => client.instagram.latestPosts(".")],
    ["instagram.posts", () => client.instagram.posts("")],
    ["instagram.highlights", () => client.instagram.highlights("")],
    ["instagram.highlight", () => client.instagram.highlight("")],
    ["instagram.mediaById", () => client.instagram.mediaById("nasa", "")],
    ["instagram.media", () => client.instagram.media("")],
    ["instagram.download", () => client.instagram.download("")],
    ["instagram.shortcodeToId", () => client.instagram.shortcodeToId("")],
    ["instagram.idToShortcode", () => client.instagram.idToShortcode("")],
    ["instagram.reel", () => client.instagram.reel("")],
    ["tiktok.profile", () => client.tiktok.profile("")],
    ["tiktok.video", () => client.tiktok.video("")],
    ["youtube.videos", () => client.youtube.videos("")],
    ["github.profile", () => client.github.profile("")],
    ["github.followers", () => client.github.followers("..")],
    ["github.following", () => client.github.following("")],
    ["github.repositories", () => client.github.repositories("")],
    ["hackernews.item", () => client.hackernews.item(Number.NaN)],
    ["hackernews.user", () => client.hackernews.user("")],
    ["hackernews.submissions", () => client.hackernews.submissions("")],
    ["hackernews.comments", () => client.hackernews.comments("")],
    ["bluesky.profile", () => client.bluesky.profile("")],
    ["bluesky.posts", () => client.bluesky.posts("")],
    ["twitch.profile", () => client.twitch.profile("")],
    ["twitch.videos", () => client.twitch.videos("")],
    ["linktree.profile", () => client.linktree.profile("")],
  ];

  it.each(calls)("%s rejects instead of throwing synchronously", async (_name, call) => {
    let result: Promise<unknown> | undefined;
    expect(() => {
      result = call();
    }).not.toThrow();
    await expect(result).rejects.toBeInstanceOf(TypeError);
    expect(fetch).not.toHaveBeenCalled();
  });
});
