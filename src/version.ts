declare const __SDK_VERSION__: string | undefined;

// Injected at build time from package.json (tsup and vitest `define`). The
// release pipeline sets package.json's version from the new git tag right
// before building, so the repository itself never stores a release number.
export const VERSION: string = typeof __SDK_VERSION__ === "string" ? __SDK_VERSION__ : "0.0.0-development";
