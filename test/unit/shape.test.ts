import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NULLABLE, nullableFor } from "../smoke/nullable.js";
import { sameShape } from "../smoke/shape.js";

describe("sameShape", () => {
  it("accepts matching shapes, documented nulls and extra keys", () => {
    expect(sameShape({ a: 1, b: "s", c: [{ d: "x" }], n: 5, extra: true }, { a: 2, b: "t", c: [{ d: "y" }], n: null })).toEqual(
      [],
    );
  });

  it("reports type mismatches with their path", () => {
    expect(sameShape({ a: "1", c: [{ d: 3 }] }, { a: 1, c: [{ d: "y" }] })).toEqual([
      "a: expected number, got string",
      "c[0].d: expected string, got number",
    ]);
  });

  it("reports missing documented keys", () => {
    expect(sameShape({}, { a: 1 })).toEqual(["a: missing"]);
  });

  it("distinguishes arrays from objects", () => {
    expect(sameShape({ a: {} }, { a: [] })).toEqual(["a: expected array, got object"]);
  });

  it("reports null where the documented value is non-null", () => {
    expect(sameShape({ a: null, c: [{ d: null }], o: null }, { a: "s", c: [{ d: 1 }], o: { x: 1 } })).toEqual([
      "a: null where documented string",
      "c[0].d: null where documented number",
      "o: null where documented object",
    ]);
  });

  it("reports a null root", () => {
    expect(sameShape(null, { a: 1 })).toEqual(["(root): null where documented object"]);
  });

  it("accepts null and absence on allowlisted paths", () => {
    const nullable = new Set(["a", "c[0].d", "o"]);
    expect(sameShape({ a: null, c: [{ d: null }] }, { a: "s", c: [{ d: 1 }], o: { x: 1 } }, nullable)).toEqual([]);
  });

  it("still checks the shape of allowlisted paths when they are present", () => {
    expect(sameShape({ a: 1 }, { a: "s" }, new Set(["a"]))).toEqual(["a: expected string, got number"]);
  });

  it("matches allowlisted paths exactly, not by key name", () => {
    expect(sameShape({ a: null, b: { a: null } }, { a: "s", b: { a: "s" } }, new Set(["a"]))).toEqual([
      "b.a: null where documented string",
    ]);
  });
});

describe("nullable allowlist", () => {
  const fixtureIds = readdirSync(new URL("../fixtures/", import.meta.url))
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));

  it("is keyed by existing fixture ids", () => {
    for (const id of Object.keys(NULLABLE)) expect(fixtureIds, id).toContain(id);
  });

  it("covers the fields the platforms leave empty", () => {
    expect(nullableFor("gh-profile")).toEqual(new Set(["name", "bio", "company", "location", "blog"]));
    expect(nullableFor("gh-repos").has("items[0].description")).toBe(true);
    expect(nullableFor("gh-repos").has("items[0].language")).toBe(true);
    expect(nullableFor("hn-item").has("url")).toBe(true);
    expect(nullableFor("hn-feed").has("items[0].url")).toBe(true);
    expect(nullableFor("hn-user").has("about")).toBe(true);
    expect(nullableFor("tw-profile").has("last_broadcast")).toBe(true);
    expect(nullableFor("ig-timeline").has("medias[0].caption")).toBe(true);
    expect(nullableFor("ig-reels").has("caption")).toBe(true);
    expect(nullableFor("bs-profile")).toEqual(new Set(["description", "avatar", "banner"]));
  });

  it("is empty for fixtures without nullable fields", () => {
    expect(nullableFor("lt-profile").size).toBe(0);
  });
});
