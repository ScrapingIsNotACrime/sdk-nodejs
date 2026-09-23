// Regenerates test/fixtures/*.json from the Dashboard's docs examples.
// Usage: node scripts/extract-fixtures.mjs <compiled docs-data.mjs>
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const source = process.argv[2];
if (!source) {
  console.error("usage: node scripts/extract-fixtures.mjs <compiled docs-data.mjs>");
  process.exit(1);
}

const { platforms } = await import(pathToFileURL(resolve(source)).href);
const outDir = resolve("test/fixtures");
mkdirSync(outDir, { recursive: true });

let written = 0;
for (const platform of platforms) {
  for (const endpoint of platform.endpoints) {
    if (!endpoint.example) continue;
    const match = endpoint.example.request.match(/https:\/\/api\.scrapingisnotacrime\.com\/v1([^"\s]+)/);
    if (!match) throw new Error(`no request URL in example ${endpoint.id}`);
    const fixture = { request: match[1], response: endpoint.example.response };
    writeFileSync(resolve(outDir, `${endpoint.id}.json`), `${JSON.stringify(fixture, null, 2)}\n`);
    written++;
  }
}
console.log(`wrote ${written} fixtures to ${outDir}`);
