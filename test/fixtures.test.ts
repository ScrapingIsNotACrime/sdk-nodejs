import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dir = new URL("./fixtures/", import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

describe("fixtures", () => {
  it("has one fixture per documented example", () => {
    expect(files).toHaveLength(30);
  });

  it.each(files)("%s is an envelope with a /v1 request path", (file) => {
    const fixture = JSON.parse(readFileSync(new URL(file, dir), "utf8"));
    expect(fixture.request).toMatch(/^\/[a-z]+\//);
    expect(fixture.response).toEqual(
      expect.objectContaining({ message: expect.any(String), data: expect.anything() }),
    );
  });

  it("never shows the legacy hob_ key prefix", () => {
    for (const file of files) {
      expect(readFileSync(new URL(file, dir), "utf8")).not.toContain("hob_");
    }
  });
});
