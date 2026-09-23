import { type HttpClient, segment } from "../http.js";
import type { GithubTrendingOptions, PageOptions } from "../options.js";
import { type Page, numberedPage } from "../pagination.js";
import type {
  GithubProfile,
  GithubRepository,
  GithubRepositoryPage,
  GithubRepositorySearchPage,
  GithubTrending,
  GithubUser,
  GithubUserPage,
} from "../types/github.js";

export class Github {
  constructor(private readonly http: HttpClient) {}

  /** GET /github/profiles/{handle} */
  profile(handle: string): Promise<GithubProfile> {
    return this.http.get(`/github/profiles/${segment(handle)}`);
  }

  /** GET /github/profiles/{handle}/followers — limit 1–100 (default 30), 1-based pages. */
  followers(handle: string, options: PageOptions = {}): Promise<Page<GithubUser, GithubUserPage>> {
    return this.list(`/github/profiles/${segment(handle)}/followers`, {}, options);
  }

  /** GET /github/profiles/{handle}/following — limit 1–100 (default 30), 1-based pages. */
  following(handle: string, options: PageOptions = {}): Promise<Page<GithubUser, GithubUserPage>> {
    return this.list(`/github/profiles/${segment(handle)}/following`, {}, options);
  }

  /** GET /github/profiles/{handle}/repositories — limit 1–100 (default 30), 1-based pages. */
  repositories(handle: string, options: PageOptions = {}): Promise<Page<GithubRepository, GithubRepositoryPage>> {
    return this.list(`/github/profiles/${segment(handle)}/repositories`, {}, options);
  }

  /** GET /github/repositories — q in GitHub search syntax; limit 1–100 (default 30), 1-based pages. */
  searchRepositories(q: string, options: PageOptions = {}): Promise<Page<GithubRepository, GithubRepositorySearchPage>> {
    return this.list("/github/repositories", { q }, options);
  }

  /** GET /github/trending/repositories — since defaults to "daily"; limit 1–100 (default 30). */
  trending(options: GithubTrendingOptions = {}): Promise<GithubTrending> {
    return this.http.get("/github/trending/repositories", {
      since: options.since,
      language: options.language,
      limit: options.limit,
    });
  }

  private list<T, R extends { items: T[]; has_more: boolean }>(
    path: string,
    query: Record<string, string>,
    options: PageOptions,
  ): Promise<Page<T, R>> {
    return numberedPage({
      page: options.page ?? 1,
      load: (page) => this.http.get<R>(path, { ...query, limit: options.limit, page }),
      items: (data) => data.items,
      hasMore: (data) => data.has_more,
    });
  }
}
