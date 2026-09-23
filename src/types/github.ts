/** GET /github/profiles/{handle} */
export interface GithubProfile {
  username: string;
  id: number;
  /** Null when the user has not set a display name. */
  name?: string | null;
  /** Null when the user has not set a bio. */
  bio?: string | null;
  company?: string | null;
  location?: string | null;
  /** Website URL; empty or null when the user has not set one. */
  blog?: string | null;
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
  /** Null when the repository has no description. */
  description?: string | null;
  stars: number;
  forks: number;
  /** Primary language; null when GitHub has not detected one. */
  language?: string | null;
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
export interface GithubRepositorySearchPage {
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
