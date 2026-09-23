import { type HttpClient, segment } from "../http.js";
import type { CursorPageOptions } from "../options.js";
import { type Page, cursorPage } from "../pagination.js";
import type { BlueskyPost, BlueskyPostPage, BlueskyProfile } from "../types/bluesky.js";

export class Bluesky {
  constructor(private readonly http: HttpClient) {}

  /** GET /bluesky/profiles/{handle} — full handle including the domain. */
  profile(handle: string): Promise<BlueskyProfile> {
    return this.http.get(`/bluesky/profiles/${segment(handle)}`);
  }

  /** GET /bluesky/profiles/{handle}/posts — limit 1–100 (default 25), cursor-paginated. */
  posts(handle: string, options: CursorPageOptions = {}): Promise<Page<BlueskyPost, BlueskyPostPage>> {
    return cursorPage({
      cursor: options.cursor,
      load: (cursor) =>
        this.http.get<BlueskyPostPage>(`/bluesky/profiles/${segment(handle)}/posts`, { limit: options.limit, cursor }),
      items: (data) => data.posts,
      hasMore: (data) => data.has_more,
      nextCursor: (data) => data.next_cursor,
    });
  }
}
