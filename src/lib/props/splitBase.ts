import { splitProps } from "solid-js";
import type { IComponentBaseProps } from "../../components/types";

/**
 * The four props every component in this library accepts and handles the same
 * way. Kept as a runtime array because `splitProps` needs the keys at runtime.
 */
export const BASE_PROP_KEYS = [
  "class",
  "className",
  "dataTheme",
  "style",
] as const;

/**
 * Splits props into `[base, own, rest]`.
 *
 * 104 component files opened with the same eight-line `splitProps` call listing
 * `class`, `className`, `dataTheme` and `style` alongside their real props, and
 * the ones that forgot an entry leaked it onto the DOM as an unknown attribute.
 *
 * This must be called in the component body, not wrapped in a memo or a
 * callback: `splitProps` returns proxies over the original getters, and the
 * split has to happen where the props object is live.
 */
export function splitBase<
  T extends IComponentBaseProps,
  K extends readonly (keyof T)[],
>(props: T, ownKeys: K) {
  return splitProps(
    props,
    BASE_PROP_KEYS as unknown as (keyof T)[],
    ownKeys as unknown as (keyof T)[],
  ) as unknown as [
    IComponentBaseProps,
    Pick<T, K[number]>,
    Omit<T, K[number] | keyof IComponentBaseProps>,
  ];
}
