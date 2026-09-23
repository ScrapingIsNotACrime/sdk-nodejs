import { type HttpClient, segment } from "../http.js";
import type { YoutubeChannelVideos } from "../types/youtube.js";

export class Youtube {
  constructor(private readonly http: HttpClient) {}

  /** GET /youtube/channel/{handle}/videos */
  videos(handle: string): Promise<YoutubeChannelVideos> {
    return this.http.get(`/youtube/channel/${segment(handle)}/videos`);
  }
}
