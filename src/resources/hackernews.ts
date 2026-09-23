import { type HttpClient, segment } from "../http.js";
import type { HackernewsFeed, PageOptions } from "../options.js";
import { type Page, numberedPage } from "../pagination.js";
import type {
  HackernewsUserComment,
  HackernewsUserCommentPage,
  HackernewsItem,
  HackernewsStory,
  HackernewsStoryPage,
  HackernewsUser,
} from "../types/hackernews.js";


export class Hackernews {
  constructor(private readonly http: HttpClient) {}

  /** GET /hackernews/feeds/{feed} — limit 1–50 (default 20), 0-based pages. */
  async feed(feed: HackernewsFeed, options: PageOptions = {}): Promise<Page<HackernewsStory, HackernewsStoryPage>> {
    return this.list(`/hackernews/feeds/${segment(feed)}`, {}, options);
  }

  /** GET /hackernews/items/{id} — the item with its full comment tree. */
  async item(id: number): Promise<HackernewsItem> {
    return this.http.get(`/hackernews/items/${segment(id)}`);
  }

  /** GET /hackernews/search — limit 1–50 (default 20), 0-based pages. */
  async search(q: string, options: PageOptions = {}): Promise<Page<HackernewsStory, HackernewsStoryPage>> {
    return this.list("/hackernews/search", { q }, options);
  }

  /** GET /hackernews/users/{username} */
  async user(username: string): Promise<HackernewsUser> {
    return this.http.get(`/hackernews/users/${segment(username)}`);
  }

  /** GET /hackernews/users/{username}/submissions — limit 1–50 (default 20), 0-based pages. */
  async submissions(username: string, options: PageOptions = {}): Promise<Page<HackernewsStory, HackernewsStoryPage>> {
    return this.list(`/hackernews/users/${segment(username)}/submissions`, {}, options);
  }

  /** GET /hackernews/users/{username}/comments — limit 1–50 (default 20), 0-based pages. */
  async comments(username: string, options: PageOptions = {}): Promise<Page<HackernewsUserComment, HackernewsUserCommentPage>> {
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
