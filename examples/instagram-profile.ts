import { ScrapingIsNotACrime } from "../src/index.js";

// Reads SCRAPINGISNOTACRIME_API_KEY from the environment.
const client = new ScrapingIsNotACrime();

const profile = await client.instagram.profile("nasa");
console.log(profile.username, profile.followers);
