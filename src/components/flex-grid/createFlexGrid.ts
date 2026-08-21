import { type Accessor, createMemo, createSignal } from "solid-js";

/**
 * Incremental reveal for a long list: render N, reveal more on demand.
 *
 * This is not `createDataGrid`. That one is discrete pagination — page 3 of 12,
 * with the reader moving between fixed windows. This is the other shape: one
 * continuous list that starts short and grows, which is what a feed, a log or an
 * item list wants. Both exist because neither can be spelled as the other
 * without lying to the reader about where they are.
 *
 * The cost this removes is construction, not data. A list of 700 rows where 20
 * are visible still builds 700 subtrees, and in a component library each of
 * those rows is a handful of instances rather than one element. The consuming
 * application measured a 40-row log at 122-178ms of a 203-339ms panel build for
 * exactly this reason.
 *
 * Headless on purpose: the reveal rule is the part worth testing and the part
 * every consumer shares, while the markup is the part each one wants to own.
 */
export interface CreateFlexGridOptions<T> {
  /** Everything there is, in the order it should appear. */
  rows: Accessor<readonly T[]>;
  /**
   * How many rows to build up front, and how many each reveal adds.
   *
   * Twenty by default, which covers a typical viewport without building a
   * screenful of rows nobody scrolls to.
   */
  pageSize?: number;
  /**
   * Reveal from the end rather than the start.
   *
   * A task log or a transcript is read newest-first: its useful rows are the
   * last ones, so the first page should be the tail and "more" should mean
   * *earlier*. A to-do list is the opposite. Defaults to `false`.
   */
  fromEnd?: boolean;
}

export interface FlexGridModel<T> {
  /** The rows to render now. */
  visible: Accessor<T[]>;
  /** How many rows exist in total, revealed or not. */
  total: Accessor<number>;
  /** How many are still hidden. */
  remaining: Accessor<number>;
  /** Whether anything is left to reveal. */
  hasMore: Accessor<boolean>;
  /** How many the next reveal will add: the page size, or whatever is left. */
  nextCount: Accessor<number>;
  /** Reveal one more page. A no-op once everything is visible. */
  revealMore(): void;
  /** Reveal everything at once. */
  revealAll(): void;
  /** Back to a single page. */
  reset(): void;
  /**
   * Handle a scroll event from the element that owns the scrollbar.
   *
   * A scroll listener rather than an `IntersectionObserver` sentinel, and that
   * is deliberate rather than dated: consumers of this library do not all run in
   * a browser engine that has observers. One of them renders through Blitz,
   * where `IntersectionObserver`, `ResizeObserver` and `MutationObserver` are
   * all absent, so a sentinel would never intersect, `revealMore` would never
   * fire, and the list would silently stop at its first page with no error to
   * explain it. A `scroll` event is the one signal every target has.
   */
  onScroll(event: Event): void;
}

/** How close to the end counts as "at the end", in CSS pixels. */
const SCROLL_THRESHOLD = 120;

export function createFlexGrid<T>(options: CreateFlexGridOptions<T>): FlexGridModel<T> {
  const pageSize = Math.max(1, options.pageSize ?? 20);
  const [limit, setLimit] = createSignal(pageSize);

  const total = createMemo(() => options.rows().length);
  const visible = createMemo(() => {
    const all = options.rows();
    const count = Math.min(limit(), all.length);
    // From the end, the window is the *tail*, so revealing more extends
    // backwards and the rows already on screen keep their positions.
    return options.fromEnd ? all.slice(all.length - count) : all.slice(0, count);
  });
  const remaining = createMemo(() => Math.max(0, total() - visible().length));
  const hasMore = createMemo(() => remaining() > 0);
  const nextCount = createMemo(() => Math.min(pageSize, remaining()));

  const revealMore = (): void => {
    if (!hasMore()) return;
    setLimit((current) => current + pageSize);
  };

  const revealAll = (): void => {
    setLimit(total());
  };

  const reset = (): void => {
    setLimit(pageSize);
  };

  const onScroll = (event: Event): void => {
    if (!hasMore()) return;
    const element = event.currentTarget as HTMLElement | null;
    if (!element) return;
    /*
     * From the end, "more" is above, so the trigger is the *top* of the
     * scroller. Reading `scrollTop` against the threshold covers both without
     * the caller having to say which way the list runs.
     */
    const atEdge = options.fromEnd
      ? element.scrollTop <= SCROLL_THRESHOLD
      : element.scrollHeight - element.scrollTop - element.clientHeight <= SCROLL_THRESHOLD;
    if (atEdge) revealMore();
  };

  return { visible, total, remaining, hasMore, nextCount, revealMore, revealAll, reset, onScroll };
}
