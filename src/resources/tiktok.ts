import { type HttpClient, segment } from "../http.js";
import type { TiktokProfile, TiktokVideo } from "../types/tiktok.js";

export class Tiktok {
  constructor(private readonly http: HttpClient) {}

  /** GET /tiktok/profile/{username} */
  profile(username: string): Promise<TiktokProfile> {
    return this.http.get(`/tiktok/profile/${segment(username)}`);
  }

  /** GET /tiktok/video/{videoId} */
  video(videoId: string): Promise<TiktokVideo> {
    return this.http.get(`/tiktok/video/${segment(videoId)}`);
  }
}
