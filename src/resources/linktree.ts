import { type HttpClient, segment } from "../http.js";
import type { LinktreeProfile } from "../types/linktree.js";

export class Linktree {
  constructor(private readonly http: HttpClient) {}

  /** GET /linktree/profiles/{handle} */
  async profile(handle: string): Promise<LinktreeProfile> {
    return this.http.get(`/linktree/profiles/${segment(handle)}`);
  }
}
