import { describe, expect, it } from "vitest";
import { clientReturning, expectSingle, fixture, pathArg, queryArgs } from "./harness.js";
import igProfile from "../fixtures/ig-profile.json" with { type: "json" };
import igContact from "../fixtures/ig-contact.json" with { type: "json" };
import igTimeline from "../fixtures/ig-timeline.json" with { type: "json" };
import igTimelinePaged from "../fixtures/ig-timeline-paged.json" with { type: "json" };
import igHighlights from "../fixtures/ig-highlights.json" with { type: "json" };
import igHighlightContent from "../fixtures/ig-highlight-content.json" with { type: "json" };
import igMediaById from "../fixtures/ig-media-by-id.json" with { type: "json" };
import igMediaDownload from "../fixtures/ig-media-download.json" with { type: "json" };
import igShortcodeToId from "../fixtures/ig-shortcode-to-id.json" with { type: "json" };
import igIdToShortcode from "../fixtures/ig-id-to-shortcode.json" with { type: "json" };
import igReels from "../fixtures/ig-reels.json" with { type: "json" };
import type {
  InstagramContact,
  InstagramDownload,
  InstagramHighlight,
  InstagramHighlights,
  InstagramLatestPosts,
  InstagramMediaDetail,
  InstagramProfile,
  InstagramReel,
  InstagramShortcodeId,
  InstagramTimelinePage,
} from "../../src/types/instagram.js";

// Compile-time gates: `tsc --noEmit` fails if a documented example doesn't fit its type.
export const gates: unknown[] = [
  igProfile.response.data satisfies InstagramProfile,
  igContact.response.data satisfies InstagramContact,
  igTimeline.response.data satisfies InstagramLatestPosts,
  igTimelinePaged.response.data satisfies InstagramTimelinePage,
  igHighlights.response.data satisfies InstagramHighlights,
  igHighlightContent.response.data satisfies InstagramHighlight,
  igMediaById.response.data satisfies InstagramMediaDetail,
  igMediaDownload.response.data satisfies InstagramDownload,
  igShortcodeToId.response.data satisfies InstagramShortcodeId,
  igIdToShortcode.response.data satisfies InstagramShortcodeId,
  igReels.response.data satisfies InstagramReel,
];

describe("contract: instagram", () => {
  it("instagram.profile", expectSingle("ig-profile", (c) => c.instagram.profile(pathArg("ig-profile", 2))));
  it("instagram.contact", expectSingle("ig-contact", (c) => c.instagram.contact(pathArg("ig-contact", 2))));
  it("instagram.latestPosts", expectSingle("ig-timeline", (c) => c.instagram.latestPosts(pathArg("ig-timeline", 2))));
  it("instagram.highlights", expectSingle("ig-highlights", (c) => c.instagram.highlights(pathArg("ig-highlights", 2))));
  it("instagram.highlight", async () => {
    // The fixture's raw request keeps the literal ":" in the highlight id unencoded (valid in a
    // path segment per RFC 3986), but `segment()` percent-encodes it via encodeURIComponent, as it
    // does for every path argument across the SDK — so the outgoing request differs textually
    // (though not semantically) from the documented curl example. Assert against the encoded form.
    const f = fixture("ig-highlight-content");
    const { client, called } = clientReturning(f.response);
    await expect(client.instagram.highlight(pathArg("ig-highlight-content", 2))).resolves.toEqual(f.response.data);
    expect(called()).toEqual(["/instagram/highlights/highlight%3A18201653992314974"]);
  });
  it("instagram.mediaById", expectSingle("ig-media-by-id", (c) => c.instagram.mediaById(pathArg("ig-media-by-id", 2), pathArg("ig-media-by-id", 4))));
  it("instagram.download", expectSingle("ig-media-download", (c) => c.instagram.download(pathArg("ig-media-download", 2))));
  it("instagram.shortcodeToId", expectSingle("ig-shortcode-to-id", (c) => c.instagram.shortcodeToId(pathArg("ig-shortcode-to-id", 2))));
  it("instagram.idToShortcode", expectSingle("ig-id-to-shortcode", (c) => c.instagram.idToShortcode(pathArg("ig-id-to-shortcode", 3))));
  it("instagram.reel", expectSingle("ig-reels", (c) => c.instagram.reel(pathArg("ig-reels", 2))));

  it("instagram.media", async () => {
    const f = fixture("ig-media-by-id");
    const { client, called } = clientReturning(f.response);
    await expect(client.instagram.media("C8xQz1aP9Kv")).resolves.toEqual(f.response.data);
    expect(called()).toEqual(["/instagram/media/C8xQz1aP9Kv"]);
  });

  it("instagram.posts follows next_cursor", async () => {
    const f = fixture<{ medias: unknown[]; next_cursor: string; has_more: boolean }>("ig-timeline-paged");
    const end = { message: "ok", data: { medias: [], has_more: false, next_cursor: null } };
    const { client, called } = clientReturning(f.response, end);
    const q = queryArgs("ig-timeline-paged");
    const page = await client.instagram.posts(pathArg("ig-timeline-paged", 2), {
      count: q.count as number,
      cursor: q.cursor as string | undefined,
    });
    expect(page.items).toEqual(f.response.data.medias);
    expect(page.hasMore).toBe(true);
    expect(page.nextCursor).toBe(f.response.data.next_cursor);
    expect(called()).toEqual([f.request]);
    const all: unknown[] = [];
    for await (const m of page) all.push(m);
    expect(all).toEqual(f.response.data.medias);
    expect(called()[1]).toContain(`cursor=${encodeURIComponent(f.response.data.next_cursor)}`);
  });
});
