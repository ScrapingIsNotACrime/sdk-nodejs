/** GET /github/profiles/{handle} */
export interface GithubProfile {
  username: string;
  id: number;
  name: string;
  /** Null when the user has not set a bio. */
  bio?: string | null;
  company: string;
  location: string;
  blog: string;
  public_repos: number;
  followers: number;
  following: number;
  avatar: string;
  created_at: string;
  url: string;
}

/** A user in a followers/following page. */
export interface GithubUser {
  username: string;
  id: number;
  avatar: string;
  url: string;
}

/** GET /github/profiles/{handle}/followers and /following */
export interface GithubUserPage {
  items: GithubUser[];
  /** Always null: GitHub's REST API does not report a count for this collection. */
  total?: number | null;
  has_more: boolean;
}

/** A repository, as returned by the profile repositories list, search, and trending endpoints. */
export interface GithubRepository {
  name: string;
  full_name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  is_fork: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  url: string;
}

/** GET /github/profiles/{handle}/repositories */
export interface GithubRepositoryPage {
  items: GithubRepository[];
  /** Always null: GitHub's REST API does not report a count for this collection. */
  total?: number | null;
  has_more: boolean;
}

/** GET /github/repositories */
export interface GithubRepositorySearch {
  items: GithubRepository[];
  total: number;
  page: number;
  has_more: boolean;
}

/** GET /github/trending/repositories */
export interface GithubTrending {
  items: GithubRepository[];
  total: number;
  page: number;
  has_more: boolean;
}
