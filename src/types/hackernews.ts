/** A story, as returned by feeds, search, and a user's submissions. */
export interface HackernewsStory {
  id: number;
  title: string;
  author: string;
  points: number;
  num_comments: number;
  url: string;
  /** Self-post body as HTML; null for link posts. */
  text?: string | null;
  created_at: string;
  hn_url: string;
}

/** GET /hackernews/feeds/{feed}, /hackernews/search, and /hackernews/users/{username}/submissions */
export interface HackernewsStoryPage {
  items: HackernewsStory[];
  total: number;
  page: number;
  has_more: boolean;
}

/** A comment inside an item's comment tree; replies nest recursively. */
export interface HackernewsComment {
  id: number;
  author: string;
  text: string;
  created_at: string;
  replies: HackernewsComment[];
}

/** GET /hackernews/items/{id} */
export interface HackernewsItem {
  id: number;
  type: string;
  title: string;
  author: string;
  points: number;
  url: string;
  /** Self-post body as HTML; null for link posts. */
  text?: string | null;
  created_at: string;
  hn_url: string;
  comments: HackernewsComment[];
}

/** GET /hackernews/users/{username} */
export interface HackernewsUser {
  username: string;
  karma: number;
  about: string;
  created_at: string;
  submission_count: number;
  hn_url: string;
}

/** GET /hackernews/users/{username}/comments — same page envelope as the other listings. */
export interface HackernewsCommentPage {
  items: HackernewsComment[];
  total: number;
  page: number;
  has_more: boolean;
}
