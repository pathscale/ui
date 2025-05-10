/**
 * Creates a function that calls a series of callbacks in order with the same arguments.
 *
 * @param callbacks An iterable of callback functions to invoke.
 * @returns A function that will execute all callbacks with the provided arguments.
 */
export function chain<Args extends [] | unknown[]>(callbacks: {
  [Symbol.iterator]: () => IterableIterator<
    ((...args: Args) => unknown) | undefined
  >;
}): (...args: Args) => void {
  return (...args: Args) => {
    for (const callback of callbacks) callback?.(...args);
  };
}
