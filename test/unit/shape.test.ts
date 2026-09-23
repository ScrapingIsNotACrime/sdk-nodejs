import { describe, expect, it } from "vitest";
import { sameShape } from "../smoke/shape.js";

describe("sameShape", () => {
  it("accepts matching shapes, nulls and extra keys", () => {
    expect(sameShape({ a: 1, b: null, c: [{ d: "x" }], extra: true }, { a: 2, b: "s", c: [{ d: "y" }] })).toEqual([]);
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
});
