import { type ClientOptions, resolveConfig } from "./config.js";
import { HttpClient } from "./http.js";
import { Appstore } from "./resources/appstore.js";
import { Bluesky } from "./resources/bluesky.js";
import { Github } from "./resources/github.js";
import { Hackernews } from "./resources/hackernews.js";
import { Linktree } from "./resources/linktree.js";
import { Tiktok } from "./resources/tiktok.js";
import { Twitch } from "./resources/twitch.js";
import { Youtube } from "./resources/youtube.js";

export class ScrapingIsNotACrime {
  readonly tiktok: Tiktok;
  readonly youtube: Youtube;
  readonly appstore: Appstore;
  readonly bluesky: Bluesky;
  readonly twitch: Twitch;
  readonly linktree: Linktree;
  readonly github: Github;
  readonly hackernews: Hackernews;

  constructor(options: ClientOptions = {}) {
    const http = new HttpClient(resolveConfig(options));
    this.tiktok = new Tiktok(http);
    this.youtube = new Youtube(http);
    this.appstore = new Appstore(http);
    this.bluesky = new Bluesky(http);
    this.twitch = new Twitch(http);
    this.linktree = new Linktree(http);
    this.github = new Github(http);
    this.hackernews = new Hackernews(http);
  }
}
