import { chain } from "@src/lib/iterable";

/**
 * Utility for chaining multiple `ref` assignments with `props.ref` forwarding.
 *
 * @param refs An array of refs to merge.
 * @returns A function that assigns the element to all provided refs.
 */
export function mergeRefs<T>(
  ...refs: (T | ((value: T) => void) | undefined)[]
): (element: T) => void {
  return chain(refs as ((element: T) => void)[]);
}
