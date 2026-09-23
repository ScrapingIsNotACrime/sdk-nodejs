// Paths each documented example may legitimately come back null (or absent) in a real
// response, mirroring the `?: T | null` fields of the public types. Keyed by fixture id;
// dotted paths, `[0]` for array elements. Keep in sync with src/types when loosening a field.

const under = (prefix: string, fields: readonly string[]) => fields.map((field) => `${prefix}.${field}`);

const GITHUB_PROFILE = ["name", "bio", "company", "location", "blog"];
const GITHUB_REPOSITORY = ["description", "language"];
const HACKERNEWS_STORY = ["url", "text"];
const HACKERNEWS_ITEM = ["title", "points", "url", "text"];
const INSTAGRAM_MEDIA = ["caption", "location"];
const INSTAGRAM_POST = ["caption", "location", "thumbnail_resources", "clips_music_attribution_info"];

export const NULLABLE: Readonly<Record<string, readonly string[]>> = {
  "bs-profile": ["description", "avatar", "banner"],
  "bs-posts": ["next_cursor"],
  "gh-profile": GITHUB_PROFILE,
  "gh-followers": ["total"],
  "gh-repos": [...under("items[0]", GITHUB_REPOSITORY), "total"],
  "gh-search-repos": under("items[0]", GITHUB_REPOSITORY),
  "gh-trending": under("items[0]", GITHUB_REPOSITORY),
  "hn-feed": under("items[0]", HACKERNEWS_STORY),
  "hn-search": under("items[0]", HACKERNEWS_STORY),
  "hn-user-submissions": under("items[0]", HACKERNEWS_STORY),
  "hn-item": HACKERNEWS_ITEM,
  "hn-user": ["about"],
  "ig-profile": ["business_address_json", "business_email", "business_phone_number"],
  "ig-contact": ["email", "phone", "address"],
  "ig-timeline": under("medias[0]", INSTAGRAM_POST),
  "ig-timeline-paged": [...under("medias[0]", INSTAGRAM_MEDIA), "next_cursor"],
  "ig-highlight-content": under("items[0]", INSTAGRAM_MEDIA),
  "ig-media-by-id": INSTAGRAM_POST,
  "ig-media-download": ["assets[0].quality"],
  "ig-reels": INSTAGRAM_POST,
  "tw-profile": ["live_viewers", "last_broadcast"],
};

export function nullableFor(id: string): ReadonlySet<string> {
  return new Set(NULLABLE[id] ?? []);
}

/** hackernews.comments items vs an hn-item comment node: `replies` is optional on HackernewsUserComment. */
export const USER_COMMENT_OPTIONAL: ReadonlySet<string> = new Set(["replies"]);
