import { type HttpClient, segment } from "../http.js";
import { type Page, cursorPage } from "../pagination.js";
import type {
  InstagramContact,
  InstagramDownload,
  InstagramHighlight,
  InstagramHighlights,
  InstagramLatestPosts,
  InstagramMedia,
  InstagramMediaDetail,
  InstagramProfile,
  InstagramReel,
  InstagramShortcodeId,
  InstagramTimelinePage,
} from "../types/instagram.js";

export class Instagram {
  constructor(private readonly http: HttpClient) {}

  /** GET /instagram/profile/{username} — username without @. */
  profile(username: string): Promise<InstagramProfile> {
    return this.http.get(`/instagram/profile/${segment(username)}`);
  }

  /** GET /instagram/profile/{username}/contact — public business contact (email, phone, address). */
  contact(username: string): Promise<InstagramContact> {
    return this.http.get(`/instagram/profile/${segment(username)}/contact`);
  }

  /** GET /instagram/profile/{username}/timeline/latest — the first page of posts. */
  latestPosts(username: string): Promise<InstagramLatestPosts> {
    return this.http.get(`/instagram/profile/${segment(username)}/timeline/latest`);
  }

  /** GET /instagram/profile/{username}/timeline — full history, cursor-paginated; count 1–50 (default 12). */
  posts(
    username: string,
    options: { count?: number; cursor?: string } = {},
  ): Promise<Page<InstagramMedia, InstagramTimelinePage>> {
    return cursorPage({
      cursor: options.cursor,
      load: (cursor) =>
        this.http.get<InstagramTimelinePage>(`/instagram/profile/${segment(username)}/timeline`, {
          count: options.count,
          cursor,
        }),
      items: (data) => data.medias,
      hasMore: (data) => data.has_more,
      nextCursor: (data) => data.next_cursor,
    });
  }

  /** GET /instagram/profile/{username}/highlights */
  highlights(username: string): Promise<InstagramHighlights> {
    return this.http.get(`/instagram/profile/${segment(username)}/highlights`);
  }

  /** GET /instagram/highlights/{highlightId} */
  highlight(highlightId: string): Promise<InstagramHighlight> {
    return this.http.get(`/instagram/highlights/${segment(highlightId)}`);
  }

  /** GET /instagram/profile/{username}/media/{mediaId} */
  mediaById(username: string, mediaId: string): Promise<InstagramMediaDetail> {
    return this.http.get(`/instagram/profile/${segment(username)}/media/${segment(mediaId)}`);
  }

  /** GET /instagram/media/{shortcode} — shortcode from instagram.com/p/{shortcode}/. */
  media(shortcode: string): Promise<InstagramMediaDetail> {
    return this.http.get(`/instagram/media/${segment(shortcode)}`);
  }

  /** GET /instagram/media/{shortcode}/download — assets[0] is the best primary asset. */
  download(shortcode: string): Promise<InstagramDownload> {
    return this.http.get(`/instagram/media/${segment(shortcode)}/download`);
  }

  /** GET /instagram/media/{shortcode}/id */
  shortcodeToId(shortcode: string): Promise<InstagramShortcodeId> {
    return this.http.get(`/instagram/media/${segment(shortcode)}/id`);
  }

  /** GET /instagram/media/id/{mediaId} */
  idToShortcode(mediaId: string): Promise<InstagramShortcodeId> {
    return this.http.get(`/instagram/media/id/${segment(mediaId)}`);
  }

  /** GET /instagram/reels/{shortcode} */
  reel(shortcode: string): Promise<InstagramReel> {
    return this.http.get(`/instagram/reels/${segment(shortcode)}`);
  }
}
