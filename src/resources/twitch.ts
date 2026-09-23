import { type HttpClient, segment } from "../http.js";
import type { TwitchVideosOptions } from "../options.js";
import type { TwitchProfile, TwitchVideos } from "../types/twitch.js";

export class Twitch {
  constructor(private readonly http: HttpClient) {}

  /** GET /twitch/profiles/{handle} */
  async profile(handle: string): Promise<TwitchProfile> {
    return this.http.get(`/twitch/profiles/${segment(handle)}`);
  }

  /** GET /twitch/profiles/{handle}/videos — limit 1–100, default 20. */
  async videos(handle: string, options: TwitchVideosOptions = {}): Promise<TwitchVideos> {
    return this.http.get(`/twitch/profiles/${segment(handle)}/videos`, { limit: options.limit });
  }
}
