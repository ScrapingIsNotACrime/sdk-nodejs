export class Page<T, R> implements AsyncIterable<T> {
  constructor(
    /** The full response of this page (e.g. to read `total`). */
    readonly data: R,
    readonly items: T[],
    readonly hasMore: boolean,
    private readonly loadNext: (() => Promise<Page<T, R>>) | undefined,
    readonly nextCursor?: string,
    readonly nextPage?: number,
  ) {}

  /** Iterates every item from this page onward, fetching further pages lazily. */
  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- iterating from `this` into further fetched pages
    let page: Page<T, R> = this;
    for (;;) {
      yield* page.items;
      if (!page.hasMore || page.items.length === 0 || !page.loadNext) return;
      page = await page.loadNext();
    }
  }
}

export async function cursorPage<T, R>(spec: {
  load: (cursor: string | undefined) => Promise<R>;
  cursor: string | undefined;
  items: (data: R) => T[];
  hasMore: (data: R) => boolean;
  nextCursor: (data: R) => string | null | undefined;
}): Promise<Page<T, R>> {
  const data = await spec.load(spec.cursor);
  const next = spec.nextCursor(data) ?? undefined;
  const hasMore = spec.hasMore(data) && next !== undefined;
  return new Page(
    data,
    spec.items(data),
    hasMore,
    hasMore ? () => cursorPage({ ...spec, cursor: next }) : undefined,
    next,
    undefined,
  );
}

export async function numberedPage<T, R>(spec: {
  load: (page: number) => Promise<R>;
  page: number;
  items: (data: R) => T[];
  hasMore: (data: R, page: number) => boolean;
}): Promise<Page<T, R>> {
  const data = await spec.load(spec.page);
  const hasMore = spec.hasMore(data, spec.page);
  const nextPage = spec.page + 1;
  return new Page(
    data,
    spec.items(data),
    hasMore,
    hasMore ? () => numberedPage({ ...spec, page: nextPage }) : undefined,
    undefined,
    hasMore ? nextPage : undefined,
  );
}
