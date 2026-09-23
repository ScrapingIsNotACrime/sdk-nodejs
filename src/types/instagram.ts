/** GET /instagram/profile/{username} */
export interface InstagramProfile {
  id: string;
  fbid: string;
  username: string;
  full_name: string;
  bio: string;
  bio_links: string[];
  followers: number;
  following: number;
  medias: number;
  highlight_reel_count: number;
  profile_pic: string;
  has_ar_effects: boolean;
  has_clips: boolean;
  has_guides: boolean;
  has_channel: boolean;
  has_blocked_viewer: boolean;
  is_business_account: boolean;
  /** Null in every observed example; no evidence of its populated shape. */
  business_address_json?: unknown | null;
  business_contact_method: string;
  business_email?: string | null;
  business_phone_number?: string | null;
  business_category_name: string;
  is_professional_account: boolean;
  category_name: string;
  is_private: boolean;
  is_verified: boolean;
}

/** A profile's structured business address, from the contact endpoint. */
export interface InstagramContactAddress {
  street_address: string;
  zip_code: string;
  city_name: string;
  region_name: string;
  country_code: string;
}

/** An email address or phone number found written into a profile's bio. */
export interface InstagramFoundContact {
  value: string;
  source: string;
}

/** GET /instagram/profile/{username}/contact */
export interface InstagramContact {
  username: string;
  full_name: string;
  biography: string;
  is_verified: boolean;
  is_business: boolean;
  category: string;
  email?: string | null;
  phone?: string | null;
  external_url: string;
  /** Null for a profile with no contact information (per the endpoint's docs, all fields in that case are null). */
  address?: InstagramContactAddress | null;
  emails_found: InstagramFoundContact[];
  phones_found: InstagramFoundContact[];
}

/** Music attribution for a video/reel; null for original audio. */
export interface InstagramClipsMusicAttribution {
  artist_name: string;
  song_name: string;
  uses_original_audio: boolean;
}

/** An image post in a profile's latest-posts timeline. */
export interface InstagramLatestPostImage {
  id: string;
  shortcode: string;
  type: string;
  comments: number;
  likes: number;
  caption: string;
  location?: unknown | null;
  thumbnail_resources?: unknown | null;
  display_url: string;
  taken_at_timestamp: string;
}

/**
 * A video post in a profile's latest-posts timeline — carries extra fields
 * (video_views, video_url, has_audio, clips_music_attribution_info) the image posts lack.
 */
export interface InstagramLatestPostVideo {
  id: string;
  shortcode: string;
  type: string;
  video_views: number;
  comments: number;
  likes: number;
  caption: string;
  location?: unknown | null;
  thumbnail_resources?: unknown | null;
  display_url: string;
  video_url: string;
  has_audio: boolean;
  clips_music_attribution_info?: InstagramClipsMusicAttribution | null;
  taken_at_timestamp: string;
}

/** A post in a profile's latest-posts timeline — an image post or a video post; `type` tells them apart. */
export type InstagramLatestPostMedia = InstagramLatestPostImage | InstagramLatestPostVideo;

/** GET /instagram/profile/{username}/timeline/latest */
export interface InstagramLatestPosts {
  count: number;
  latest_count: number;
  medias: InstagramLatestPostMedia[];
}

/** A post, as returned by the paged timeline and the highlight-content endpoints. */
export interface InstagramMedia {
  id: string;
  shortcode: string;
  type: string;
  caption: string;
  likes: number;
  comments: number;
  preview_comments: unknown[];
  location?: unknown | null;
  display_url: string;
  taken_at_timestamp: string;
}

/** GET /instagram/profile/{username}/timeline */
export interface InstagramTimelinePage {
  medias: InstagramMedia[];
  has_more: boolean;
  next_cursor?: string | null;
}

/** A highlight reel's summary, as listed on a profile. */
export interface InstagramHighlightSummary {
  id: string;
  title: string;
  cover: string;
}

/** GET /instagram/profile/{username}/highlights */
export interface InstagramHighlights {
  username: string;
  user_id: string;
  highlights: InstagramHighlightSummary[];
}

/** GET /instagram/highlights/{highlightId} */
export interface InstagramHighlight {
  id: string;
  title: string;
  items: InstagramMedia[];
}

/**
 * GET /instagram/profile/{username}/media/{mediaId} — the same media object the timeline
 * endpoints return, including the video-only fields when the media is a video.
 */
export interface InstagramMediaDetail {
  id: string;
  shortcode: string;
  type: string;
  comments: number;
  likes: number;
  caption: string;
  location?: unknown | null;
  thumbnail_resources?: unknown | null;
  display_url: string;
  taken_at_timestamp: string;
  video_views?: number;
  video_url?: string;
  has_audio?: boolean;
  clips_music_attribution_info?: InstagramClipsMusicAttribution | null;
}

/** One downloadable asset behind a post, reel, or carousel. */
export interface InstagramDownloadAsset {
  kind: string;
  index: number;
  url: string;
  width: number;
  height: number;
  /** Null for non-video assets (e.g. thumbnails). */
  quality?: string | null;
  expires_at: string;
}

/** GET /instagram/media/{shortcode}/download — assets[0] is always the best primary asset. */
export interface InstagramDownload {
  shortcode: string;
  type: string;
  expires_at: string;
  assets: InstagramDownloadAsset[];
}

/** GET /instagram/media/{shortcode}/id and /instagram/media/id/{mediaId} */
export interface InstagramShortcodeId {
  shortcode: string;
  media_id: string;
}

/** GET /instagram/reels/{shortcode} — clips_music_attribution_info is null for original audio. */
export interface InstagramReel {
  id: string;
  shortcode: string;
  type: string;
  video_views: number;
  comments: number;
  likes: number;
  caption: string;
  location?: unknown | null;
  thumbnail_resources?: unknown | null;
  display_url: string;
  video_url: string;
  has_audio: boolean;
  clips_music_attribution_info?: InstagramClipsMusicAttribution | null;
  taken_at_timestamp: string;
}
