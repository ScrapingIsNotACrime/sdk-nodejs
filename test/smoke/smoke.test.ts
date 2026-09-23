// Real-API smoke test: costs one credit per documented example (30) plus the
// four endpoints without examples. Run with SCRAPINGISNOTACRIME_API_KEY set:
//   npm run test:smoke
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ScrapingIsNotACrime } from "../../src/index.js";
import { resolveConfig } from "../../src/config.js";
import { HttpClient } from "../../src/http.js";
import { USER_COMMENT_OPTIONAL, nullableFor } from "./nullable.js";
import { sameShape } from "./shape.js";

const enabled = Boolean(process.env.SCRAPINGISNOTACRIME_API_KEY);
const dir = new URL("../fixtures/", import.meta.url);
const fixtures = enabled
  ? readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => ({ id: f.replace(/\.json$/, ""), ...JSON.parse(readFileSync(new URL(f, dir), "utf8")) }))
  : [];

describe.skipIf(!enabled)("smoke: real API", () => {
  const http = enabled ? new HttpClient(resolveConfig({})) : undefined;
  const client = enabled ? new ScrapingIsNotACrime() : undefined;

  const documented = (id: string) => fixtures.find((f) => f.id === id)!.response.data;

  it.each(fixtures)("$id matches the documented shape", async ({ id, request, response }) => {
    const [path, search] = String(request).split("?");
    const query = Object.fromEntries(new URLSearchParams(search ?? ""));
    const data = await http!.get(path!, query);
    expect(sameShape(data, response.data, nullableFor(id))).toEqual([]);
  });

  it("endpoints without documented examples respond", async () => {
    const media = await client!.instagram.media(
      String(fixtures.find((f) => f.id === "ig-media-download")!.request).split("/")[3]!,
    );
    const following = await client!.github.following("torvalds", { limit: 5 });
    const comments = await client!.hackernews.comments("pg", { limit: 5 });
    console.log(JSON.stringify({ media, following: following.data, comments: comments.data }, null, 2));
    if (process.env.SMOKE_TIKTOK_VIDEO_ID) {
      console.log(JSON.stringify({ tiktokVideo: await client!.tiktok.video(process.env.SMOKE_TIKTOK_VIDEO_ID) }, null, 2));
    }
    expect(following.data.has_more).toBeTypeOf("boolean");
    expect(comments.data.has_more).toBeTypeOf("boolean");

    // No examples of their own: compare against the closest documented shape.
    expect(sameShape(media, documented("ig-media-by-id"), nullableFor("ig-media-by-id"))).toEqual([]);
    expect(sameShape(following.data, documented("gh-followers"), nullableFor("gh-followers"))).toEqual([]);
    if (comments.items.length > 0) {
      const commentNode = documented("hn-item").comments[0];
      expect(sameShape(comments.items[0], commentNode, USER_COMMENT_OPTIONAL)).toEqual([]);
    }
  });
});
