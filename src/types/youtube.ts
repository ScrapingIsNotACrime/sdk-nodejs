/** The channel block in a channel-videos response. */
export interface YoutubeChannel {
  title: string;
  description: string;
  externalId: string;
  avatar: string;
}

/** One video in a channel's video list. */
export interface YoutubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  metadataText: string[];
}

/** GET /youtube/channel/{handle}/videos */
export interface YoutubeChannelVideos {
  channel: YoutubeChannel;
  videos: YoutubeVideo[];
}
