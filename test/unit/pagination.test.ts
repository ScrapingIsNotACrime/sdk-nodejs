import { inspect } from "node:util";
import { describe, expect, it, vi } from "vitest";
import { cursorPage, numberedPage } from "../../src/pagination.js";

type CursorData = { posts: number[]; next_cursor: string | null; has_more: boolean };
type NumberedData = { items: number[]; has_more: boolean };

async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const item of iterable) out.push(item);
  return out;
}

describe("cursorPage", () => {
  const pages: Record<string, CursorData> = {
    start: { posts: [1, 2], next_cursor: "c2", has_more: true },
    c2: { posts: [3], next_cursor: "c3", has_more: true },
    c3: { posts: [4], next_cursor: null, has_more: false },
  };
  const load = vi.fn(async (cursor: string | undefined) => pages[cursor ?? "start"]!);
  const open = () =>
    cursorPage({
      load,
      cursor: undefined,
      items: (d: CursorData) => d.posts,
      hasMore: (d) => d.has_more,
      nextCursor: (d) => d.next_cursor,
    });

  it("exposes the first page", async () => {
    load.mockClear();
    const page = await open();
    expect(page.items).toEqual([1, 2]);
    expect(page.hasMore).toBe(true);
    expect(page.nextCursor).toBe("c2");
    expect(page.nextPage).toBeUndefined();
    expect(page.data).toBe(pages.start);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("iterates every item across pages, passing the cursor back", async () => {
    load.mockClear();
    expect(await collect(await open())).toEqual([1, 2, 3, 4]);
    expect(load.mock.calls.map((c) => c[0])).toEqual([undefined, "c2", "c3"]);
  });

  it("does not fetch ahead when the loop breaks", async () => {
    load.mockClear();
    const page = await open();
    for await (const item of page) {
      expect(item).toBe(1);
      break;
    }
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("stops when a page claims more but has no cursor", async () => {
    const page = await cursorPage({
      load: async () => ({ posts: [1], next_cursor: null, has_more: true }),
      cursor: undefined,
      items: (d: CursorData) => d.posts,
      hasMore: (d) => d.has_more,
      nextCursor: (d) => d.next_cursor,
    });
    expect(page.hasMore).toBe(false);
    expect(await collect(page)).toEqual([1]);
  });
});

describe("numberedPage", () => {
  it("increments the page from the given start (1-based)", async () => {
    const data: Record<number, NumberedData> = {
      1: { items: [1], has_more: true },
      2: { items: [2], has_more: false },
    };
    const load = vi.fn(async (page: number) => data[page]!);
    const page = await numberedPage({ load, page: 1, items: (d: NumberedData) => d.items, hasMore: (d) => d.has_more });
    expect(page.nextPage).toBe(2);
    expect(await collect(page)).toEqual([1, 2]);
    expect(load.mock.calls.map((c) => c[0])).toEqual([1, 2]);
  });

  it("works 0-based", async () => {
    const load = vi.fn(async (page: number) => ({ items: [page], has_more: page < 1 }));
    const page = await numberedPage({ load, page: 0, items: (d) => d.items, hasMore: (d) => d.has_more });
    expect(await collect(page)).toEqual([0, 1]);
  });

  it("stops on an empty page even if the API says there is more", async () => {
    const load = vi.fn(async (page: number) => ({ items: page === 1 ? [1] : [], has_more: true }));
    const page = await numberedPage({ load, page: 1, items: (d) => d.items, hasMore: (d) => d.has_more });
    expect(await collect(page)).toEqual([1]);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("passes the page number to hasMore (App Store caps at page 10)", async () => {
    const load = vi.fn(async (page: number) => ({ reviews: [page] }));
    const page = await numberedPage({
      load,
      page: 9,
      items: (d: { reviews: number[] }) => d.reviews,
      hasMore: (d, n) => d.reviews.length > 0 && n < 10,
    });
    expect(await collect(page)).toEqual([9, 10]);
    expect(load).toHaveBeenCalledTimes(2);
  });
});

describe("Page", () => {
  it("keeps the next-page loader private (not enumerable, not inspectable)", async () => {
    const page = await numberedPage({
      load: async (n: number) => ({ items: [n], has_more: n < 1 }),
      page: 0,
      items: (d) => d.items,
      hasMore: (d) => d.has_more,
    });
    expect(page.hasMore).toBe(true);
    expect("loadNext" in page).toBe(false);
    expect(Object.keys(page)).not.toContain("loadNext");
    expect(inspect(page)).not.toMatch(/loadNext|Function/);
    expect(await collect(page)).toEqual([0, 1]);
  });
});
