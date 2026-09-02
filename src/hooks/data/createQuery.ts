import { createRenderEffect, createSignal, onCleanup, untrack } from "solid-js";

/**
 * Asynchronous reads, without a query library.
 *
 * This exists to replace `@tanstack/solid-query`, and the replacement is not a
 * like-for-like port. One behaviour is deliberately different, and it is the
 * reason this file exists rather than a wrapper around the old one:
 *
 * **A query that has not run is not pending, and reading it never suspends.**
 *
 * TanStack keeps a query that has never fetched -- including one held back by
 * `enabled: false` -- at `status: "pending"` forever. Under Solid 2, reading a
 * pending query throws `NotReadyError` to suspend. A widget whose query was
 * disabled therefore suspended for the lifetime of the page, and because
 * `NotReadyError` extends `Error` with no message, a boundary that caught it
 * had nothing to print. That is how a support-chat button that had not
 * connected replaced an entire application with a blank error page.
 *
 * Here, `data` is `undefined` until there is data, `isLoading` is true only
 * while a fetch is actually in flight, and neither ever throws. A caller that
 * wants to suspend can do so explicitly; a caller that forgets cannot take the
 * page down.
 */

export interface CreateQueryOptions<T> {
  /**
   * Identity, for invalidation. Compared by value, and matched by prefix, so
   * `["users"]` invalidates `["users", 1]` as well.
   */
  key: readonly unknown[];
  /** The read itself. Only called when `enabled` is not false. */
  fetcher: () => Promise<T>;
  /** Held back while false. Default true. */
  enabled?: boolean;
}

/**
 * Read as properties, not as accessors.
 *
 * `solid-query` returned a store, so every consumer of it is written
 * `query.data`, `query.isLoading`, `query.isError` -- roughly three thousand
 * such reads across these applications. Exposing accessors here would mean
 * editing all of them to add `()`, turning a migration of the ~300 files that
 * *define* queries into one that touches every file that reads one.
 *
 * These are getters over signals, so a read inside a tracked scope still
 * subscribes exactly as an accessor call would.
 */
export interface QueryResult<T> {
  /** The last value read, or `undefined` before the first one arrives. */
  readonly data: T | undefined;
  /** The last failure, cleared by the next successful read. */
  readonly error: unknown;
  /** True only while a fetch is in flight. Never true for a disabled query. */
  readonly isLoading: boolean;
  /**
   * Alias of `isLoading`, for call sites carried over from `solid-query`.
   *
   * Note the deliberate difference in meaning. There, `isPending` was "has no
   * data", which stayed true forever for a query held back by `enabled: false`
   * -- so `if (isPending) return <Spinner/>` spun for the life of the page.
   * Here it means "a fetch is in flight", so a disabled query reads as not
   * pending and its consumer renders instead of hanging.
   */
  readonly isPending: boolean;
  /** True when the last read failed. */
  readonly isError: boolean;
  /** True when a value has arrived and the last read did not fail. */
  readonly isSuccess: boolean;
  /** True once a value has arrived at least once. */
  readonly isReady: boolean;
  /** Read again now, regardless of `enabled`. */
  refetch: () => Promise<void>;
}

/** Registered refetchers, so an invalidation can reach queries it does not own. */
const registry = new Set<{ key: readonly unknown[]; refetch: () => void }>();

const isPrefix = (prefix: readonly unknown[], key: readonly unknown[]): boolean =>
  prefix.length <= key.length &&
  prefix.every((part, index) => Object.is(part, key[index]));

/**
 * Re-read every live query whose key starts with `prefix`.
 *
 * The replacement for `useQueryClient().invalidateQueries({ queryKey })`. It is
 * a plain function rather than something read from context: invalidation is
 * usually wanted from a mutation handler or a store, which are not components
 * and have no context to read.
 */
export const invalidateQueries = (prefix: readonly unknown[]): void => {
  for (const entry of registry) {
    if (isPrefix(prefix, entry.key)) entry.refetch();
  }
};

export const createQuery = <T>(
  options: () => CreateQueryOptions<T>,
): QueryResult<T> => {
  const [data, setData] = createSignal<T | undefined>(undefined);
  const [error, setError] = createSignal<unknown>(undefined);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isReady, setIsReady] = createSignal(false);

  // Only the newest read may write. Without this, a key that changes while a
  // slower read is in flight resolves last and overwrites the newer answer.
  let generation = 0;

  const run = async (): Promise<void> => {
    const mine = ++generation;
    const { fetcher } = untrack(options);
    setIsLoading(true);
    try {
      const value = await fetcher();
      if (mine !== generation) return;
      setData(() => value);
      setError(undefined);
      setIsReady(true);
    } catch (caught) {
      if (mine !== generation) return;
      setError(() => caught);
    } finally {
      if (mine === generation) setIsLoading(false);
    }
  };

  // 2.0 splits a render effect in two: the first function is the tracked read,
  // the second acts on what it produced. Reading the caller's options thunk in
  // the tracked half is what makes a query follow a changing key or `enabled`
  // flag; doing the work in the second half keeps the fetch out of the
  // dependency graph.
  createRenderEffect(
    () => options(),
    ({ key, enabled = true }) => {
      if (!enabled) {
        // Cancel whatever is in flight so its result cannot land later.
        generation++;
        setIsLoading(false);
        return;
      }
      const entry = { key, refetch: () => void run() };
      registry.add(entry);
      onCleanup(() => registry.delete(entry));
      void run();
    },
  );

  onCleanup(() => {
    generation++;
  });

  return {
    get data() {
      return data();
    },
    get error() {
      return error();
    },
    get isLoading() {
      return isLoading();
    },
    get isPending() {
      return isLoading();
    },
    get isError() {
      return error() !== undefined;
    },
    get isSuccess() {
      return isReady() && error() === undefined;
    },
    get isReady() {
      return isReady();
    },
    refetch: run,
  };
};
