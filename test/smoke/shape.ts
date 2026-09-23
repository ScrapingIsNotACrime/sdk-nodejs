function kind(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

/**
 * Compares a real response against a documented example, key by key.
 * A null (or absent) real value where the example is non-null is a mismatch, unless its
 * dotted path (`items[0].description`) is in `nullable` — the fields the types declare `| null`.
 */
export function sameShape(
  real: unknown,
  documented: unknown,
  nullable: ReadonlySet<string> = new Set(),
  path = "",
): string[] {
  const expected = kind(documented);
  if (expected === "null") return [];
  const actual = kind(real);
  if (actual === "null") {
    return nullable.has(path) ? [] : [`${path || "(root)"}: null where documented ${expected}`];
  }
  if (actual !== expected) return [`${path || "(root)"}: expected ${expected}, got ${actual}`];

  if (expected === "array") {
    const [doc] = documented as unknown[];
    const [first] = real as unknown[];
    if (doc === undefined || first === undefined) return [];
    return sameShape(first, doc, nullable, `${path}[0]`);
  }

  if (expected === "object") {
    const out: string[] = [];
    for (const [key, value] of Object.entries(documented as Record<string, unknown>)) {
      const childPath = path ? `${path}.${key}` : key;
      if (!(key in (real as Record<string, unknown>))) {
        if (value !== null && !nullable.has(childPath)) out.push(`${childPath}: missing`);
        continue;
      }
      out.push(...sameShape((real as Record<string, unknown>)[key], value, nullable, childPath));
    }
    return out;
  }

  return [];
}
