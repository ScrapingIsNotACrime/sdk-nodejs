import { type HttpClient, segment } from "../http.js";
import { type Page, numberedPage } from "../pagination.js";
import type {
  HackernewsComment,
  HackernewsCommentPage,
  HackernewsItem,
  HackernewsStory,
  HackernewsStoryPage,
  HackernewsUser,
} from "../types/hackernews.js";

type PageOptions = { limit?: number; page?: number };
export type HackernewsFeed = "top" | "new" | "best" | "ask" | "show" | "job";

export class Hackernews {
  constructor(private readonly http: HttpClient) {}

  /** GET /hackernews/feeds/{feed} — limit 1–50 (default 20), 0-based pages. */
  feed(feed: HackernewsFeed, options: PageOptions = {}): Promise<Page<HackernewsStory, HackernewsStoryPage>> {
    return this.list(`/hackernews/feeds/${segment(feed)}`, {}, options);
  }

  /** GET /hackernews/items/{id} — the item with its full comment tree. */
  item(id: number): Promise<HackernewsItem> {
    return this.http.get(`/hackernews/items/${segment(id)}`);
  }

  /** GET /hackernews/search — limit 1–50 (default 20), 0-based pages. */
  search(q: string, options: PageOptions = {}): Promise<Page<HackernewsStory, HackernewsStoryPage>> {
    return this.list("/hackernews/search", { q }, options);
  }

  /** GET /hackernews/users/{username} */
  user(username: string): Promise<HackernewsUser> {
    return this.http.get(`/hackernews/users/${segment(username)}`);
  }

  /** GET /hackernews/users/{username}/submissions — limit 1–50 (default 20), 0-based pages. */
  submissions(username: string, options: PageOptions = {}): Promise<Page<HackernewsStory, HackernewsStoryPage>> {
    return this.list(`/hackernews/users/${segment(username)}/submissions`, {}, options);
  }

  /** GET /hackernews/users/{username}/comments — limit 1–50 (default 20), 0-based pages. */
  comments(username: string, options: PageOptions = {}): Promise<Page<HackernewsComment, HackernewsCommentPage>> {
    return this.list(`/hackernews/users/${segment(username)}/comments`, {}, options);
  }

  private list<T, R extends { items: T[]; has_more: boolean }>(
    path: string,
    query: Record<string, string>,
    options: PageOptions,
  ): Promise<Page<T, R>> {
    return numberedPage({
      page: options.page ?? 0,
      load: (page) => this.http.get<R>(path, { ...query, limit: options.limit, page }),
      items: (data) => data.items,
      hasMore: (data) => data.has_more,
    });
  }
}
