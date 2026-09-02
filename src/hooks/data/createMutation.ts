import { createSignal } from "solid-js";
import type { Accessor } from "solid-js";

/**
 * A write, without a query library. The companion to `createQuery`.
 *
 * Replaces `useMutation`. The same rule applies as there: reading this never
 * suspends and never throws. `mutate` reports failure through `error()`;
 * `mutateAsync` rejects, for a caller that wants to await and handle it.
 */

export interface CreateMutationOptions<TArgs extends unknown[], TResult> {
  mutationFn: (...args: TArgs) => Promise<TResult>;
  onSuccess?: (result: TResult, ...args: TArgs) => void | Promise<void>;
  onError?: (error: unknown, ...args: TArgs) => void;
  /** Runs after success or failure, like TanStack's `onSettled`. */
  onSettled?: () => void | Promise<void>;
}

export interface MutationResult<TArgs extends unknown[], TResult> {
  /** Fire and forget. Failure lands on `error()` rather than as a rejection. */
  mutate: (...args: TArgs) => void;
  /** Fire and await. Rejects on failure. */
  mutateAsync: (...args: TArgs) => Promise<TResult>;
  isPending: Accessor<boolean>;
  error: Accessor<unknown>;
  /** The last successful result. */
  data: Accessor<TResult | undefined>;
  /** Clear `error` and `data`. */
  reset: () => void;
}

export const createMutation = <TArgs extends unknown[], TResult>(
  options: () => CreateMutationOptions<TArgs, TResult>,
): MutationResult<TArgs, TResult> => {
  const [isPending, setIsPending] = createSignal(false);
  const [error, setError] = createSignal<unknown>(undefined);
  const [data, setData] = createSignal<TResult | undefined>(undefined);

  // Concurrent calls are allowed -- a table firing a row action per row is the
  // ordinary case -- so the flag counts them rather than toggling.
  let inFlight = 0;

  const mutateAsync = async (...args: TArgs): Promise<TResult> => {
    const { mutationFn, onSuccess, onError, onSettled } = options();
    inFlight++;
    setIsPending(true);
    setError(undefined);
    try {
      const result = await mutationFn(...args);
      setData(() => result);
      await onSuccess?.(result, ...args);
      return result;
    } catch (caught) {
      setError(() => caught);
      onError?.(caught, ...args);
      throw caught;
    } finally {
      inFlight--;
      if (inFlight === 0) setIsPending(false);
      await onSettled?.();
    }
  };

  return {
    mutate: (...args: TArgs) => {
      // The rejection is already recorded on `error()`; swallowing it here is
      // what keeps a fire-and-forget call from becoming an unhandled rejection.
      void mutateAsync(...args).catch(() => {});
    },
    mutateAsync,
    isPending,
    error,
    data,
    reset: () => {
      setError(undefined);
      setData(() => undefined);
    },
  };
};
