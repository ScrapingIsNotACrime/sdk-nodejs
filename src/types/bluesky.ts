/** GET /bluesky/profiles/{handle} */
export interface BlueskyProfile {
  did: string;
  handle: string;
  display_name: string;
  /** Null when the profile has no bio. */
  description?: string | null;
  /** Null when the profile has no avatar set. */
  avatar?: string | null;
  /** Banner image URL; null when the profile has none set. */
  banner?: string | null;
  followers: number;
  following: number;
  posts: number;
  created_at: string;
  url: string;
}

/** One post in a profile's posts feed. */
export interface BlueskyPost {
  uri: string;
  cid: string;
  text: string;
  author: string;
  likes: number;
  reposts: number;
  replies: number;
  quotes: number;
  created_at: string;
  indexed_at: string;
  url: string;
}

/** GET /bluesky/profiles/{handle}/posts */
export interface BlueskyPosts {
  posts: BlueskyPost[];
  next_cursor?: string | null;
  has_more: boolean;
}
