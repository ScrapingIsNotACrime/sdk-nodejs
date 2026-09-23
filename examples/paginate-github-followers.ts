import { ScrapingIsNotACrime } from "../src/index.js";

const client = new ScrapingIsNotACrime();

const page = await client.github.followers("torvalds", { limit: 100 });
let count = 0;
for await (const user of page) {
  console.log(user.username);
  if (++count >= 250) break; // stop early; no further pages are fetched
}
