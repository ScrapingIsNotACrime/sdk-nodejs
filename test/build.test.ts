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
  }, 60_000);
});
