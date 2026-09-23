import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

describe("built package", () => {
  it("builds and loads as ESM and CommonJS with zero runtime dependencies", async () => {
    execFileSync("npx", ["tsup"], { stdio: "ignore" });
    const esm = await import("../dist/index.js");
    const cjs = createRequire(import.meta.url)("../dist/index.cjs");
    expect(typeof esm.ScrapingIsNotACrime).toBe("function");
    expect(typeof cjs.ScrapingIsNotACrime).toBe("function");
    const pkg = createRequire(import.meta.url)("../package.json");
    expect(pkg.dependencies ?? {}).toEqual({});
    // The release pipeline sets package.json's version from the tag right before
    // building, so the built VERSION must come from package.json at build time.
    expect(esm.VERSION).toBe(pkg.version);
    expect(cjs.VERSION).toBe(pkg.version);
  }, 60_000);
});
