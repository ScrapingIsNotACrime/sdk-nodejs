/** One link in a Linktree profile. */
export interface LinktreeLink {
  id: string;
  title: string;
  url: string;
  type: string;
}

/** GET /linktree/profiles/{handle} */
export interface LinktreeProfile {
  username: string;
  title: string;
  description: string;
  avatar: string;
  is_verified: boolean;
  url: string;
  links: LinktreeLink[];
}
