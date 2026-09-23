function kind(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

export function sameShape(real: unknown, documented: unknown, path = ""): string[] {
  const expected = kind(documented);
  if (expected === "null") return [];
  const actual = kind(real);
  if (actual === "null") return [];
  if (actual !== expected) return [`${path || "(root)"}: expected ${expected}, got ${actual}`];

  if (expected === "array") {
    const [doc] = documented as unknown[];
    const [first] = real as unknown[];
    if (doc === undefined || first === undefined) return [];
    return sameShape(first, doc, `${path}[0]`);
  }

  if (expected === "object") {
    const out: string[] = [];
    for (const [key, value] of Object.entries(documented as Record<string, unknown>)) {
      const childPath = path ? `${path}.${key}` : key;
      if (!(key in (real as Record<string, unknown>))) {
        if (value !== null) out.push(`${childPath}: missing`);
        continue;
      }
      out.push(...sameShape((real as Record<string, unknown>)[key], value, childPath));
    }
    return out;
  }

  return [];
}
