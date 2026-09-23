/** GET /tiktok/profile/{username} */
export interface TiktokProfile {
  id: string;
  username: string;
  nickname: string;
  bio: string;
  bio_link: string;
  avatar: string;
  sec_uid: string;
  followers: number;
  following: number;
  hearts: number;
  videos: number;
  is_private: boolean;
  is_verified: boolean;
}

/** GET /tiktok/video/{videoId} — no documented example yet; refined from the smoke test. */
export interface TiktokVideo {
  id?: string;
  [key: string]: unknown;
}
