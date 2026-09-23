import { type HttpClient, segment } from "../http.js";
import type { TwitchProfile, TwitchVideos } from "../types/twitch.js";

export class Twitch {
  constructor(private readonly http: HttpClient) {}

  /** GET /twitch/profiles/{handle} */
  profile(handle: string): Promise<TwitchProfile> {
    return this.http.get(`/twitch/profiles/${segment(handle)}`);
  }

  /** GET /twitch/profiles/{handle}/videos — limit 1–100, default 20. */
  videos(handle: string, options: { limit?: number } = {}): Promise<TwitchVideos> {
    return this.http.get(`/twitch/profiles/${segment(handle)}/videos`, { limit: options.limit });
  }
}
