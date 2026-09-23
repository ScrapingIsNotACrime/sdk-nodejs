/** A channel's most recent broadcast. */
export interface TwitchBroadcast {
  title: string;
  started_at: string;
}

/** GET /twitch/profiles/{handle} */
export interface TwitchProfile {
  id: string;
  login: string;
  display_name: string;
  description: string;
  avatar: string;
  followers: number;
  is_partner: boolean;
  is_affiliate: boolean;
  created_at: string;
  is_live: boolean;
  /** Current viewer count while live; null whenever is_live is false. */
  live_viewers?: number | null;
  last_broadcast: TwitchBroadcast;
  url: string;
}

/** One video in a channel's published videos list. */
export interface TwitchVideo {
  id: string;
  title: string;
  duration_seconds: number;
  views: number;
  published_at: string;
  thumbnail: string;
  url: string;
}

/** GET /twitch/profiles/{handle}/videos */
export interface TwitchVideos {
  videos: TwitchVideo[];
  count: number;
}
