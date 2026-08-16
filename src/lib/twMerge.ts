import { twMerge as tw } from "tailwind-merge";

/**
 * `twMerge`, accepting what Solid 2 says a `class` prop can be.
 *
 * 2.0 absorbed `classList` into `class`, so `JSX.HTMLAttributes["class"]` is now
 * `ClassValue`: a string, a number, a boolean, `null`, an array of those, or a
 * `Record<string, boolean>` of conditional names. `tailwind-merge` accepts most
 * of that but not `number`, so every `twMerge(CLASSES.base, props.class)` in the
 * library stopped typechecking — 287 call sites across 114 files, each one
 * correct and each one now the wrong colour.
 *
 * Widening here rather than casting there. A cast at 287 sites is 287 chances
 * to cast to the wrong thing, and it would leave no single place to say why.
 *
 * `Record<string, boolean>` is flattened to its truthy keys, which is what the
 * old `classList` did with the same object. Numbers and booleans are dropped:
 * `class={0}` and `class={false}` are how a conditional resolves to "nothing",
 * and `tailwind-merge` has no meaning for them.
 */
type SolidClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, boolean | undefined>
  | SolidClassValue[];

const flatten = (value: SolidClassValue): string[] => {
  if (value === null || value === undefined) return [];
  if (typeof value === "string") return value ? [value] : [];
  // `class={0}` / `class={false}` are a conditional resolving to nothing.
  if (typeof value === "number" || typeof value === "boolean") return [];
  if (Array.isArray(value)) return value.flatMap(flatten);
  return Object.keys(value).filter((key) => value[key]);
};

export const twMerge = (...values: SolidClassValue[]): string =>
  tw(...values.flatMap(flatten));

export type { SolidClassValue };
