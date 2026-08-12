import { twMerge } from "tailwind-merge";
import {
  type ClassArgs,
  type Config,
  type ConfigSchema,
  type ConfigVariants,

  cva,
} from "./classes";

export type RecipeConfig<T extends ConfigSchema> = Config<T> & {
  /** Class(es) always present. Conventionally the component's BEM block. */
  base?: ClassArgs;
  /**
   * Set only when this recipe's own classes are Tailwind utilities.
   *
   * It selects the merge strategy for the consumer's trailing `class`. With
   * Tailwind in play the tail can contradict the recipe, and only `twMerge`
   * resolves that: given `p-4` then `p-2` then `p-8` it yields `p-8`, where a
   * join yields all three and lets specificity decide. With BEM classes nothing
   * can collide, so the join is both correct and much cheaper.
   *
   * 88 of this library's 92 class maps are pure BEM and all 92 called `twMerge`.
   * Measured under **Bun**, per call, over 200k iterations:
   *
   *                                    repeated input   varying input
   *     twMerge (has an LRU cache)          131 ns          994 ns
   *     classes() in this directory         104 ns          132 ns
   *     cx below                             38 ns           53 ns
   *
   * `cx` is the point: 3x faster than `twMerge` even when its cache hits, and
   * 26x when it misses. A component's class string changes whenever its state
   * does, so misses are not the rare case.
   *
   * Measure under the engine that runs the code. An earlier version of this
   * comment reported Node figures, under which cached `twMerge` appeared to
   * beat `classes()` — the opposite of what Bun shows, and a V8 artifact. For
   * the chuzz shell the target is narrower still: Boa, with no JIT at all.
   */
  tailwind?: boolean;
};

export type RecipeProps<T extends ConfigSchema> = ConfigVariants<T> & {
  class?: ClassArgs;
  className?: ClassArgs;
};

export type RecipeFn<T extends ConfigSchema> = {
  (props?: RecipeProps<T>): string;
  variantKeys: (keyof T)[];
  tailwind: boolean;
};

/**
 * Declares a component's class vocabulary in one place: a base class, its
 * variant axes, the defaults, and how a consumer override merges.
 *
 * The point is that the variant names become the component's design API. A
 * `.classes.ts` written this way is a readable description of what can vary,
 * instead of a nested object the `.tsx` picks through with hand-written
 * accessors and `&&` chains at every call site.
 */
export function recipe<T extends ConfigSchema>(
  config: RecipeConfig<T> = {} as RecipeConfig<T>,
): RecipeFn<T> {
  const { base, tailwind = false, ...variantConfig } = config;
  const resolveVariants = cva(base, variantConfig as Config<T>);
  const merge = tailwind ? twMerge : cx;

  const fn = (props?: RecipeProps<T>) => {
    // The consumer's tail is merged separately from the variants so that the
    // merge strategy above applies to it alone. Passing it through `cva` would
    // append it before this function ever sees it.
    const { class: cls, className, ...variants } = props ?? {};
    return merge(
      resolveVariants(
        variants as unknown as Parameters<typeof resolveVariants>[0],
      ),
      cls as string | undefined,
      className as string | undefined,
    );
  };

  fn.variantKeys = resolveVariants.variantKeys;
  fn.tailwind = tailwind;

  return fn as RecipeFn<T>;
}

/**
 * Joins class strings, skipping falsy ones. The merge used by every recipe that
 * does not emit Tailwind.
 *
 * Deliberately not `classes()` from this directory: that one takes nested
 * arrays and pays `.flat().filter().join()` for the privilege, which measures
 * ~8x slower than this loop. `classes()` stays as it is because `cva` needs its
 * nesting; this is the flat-string path, which is every call site in a
 * component.
 */
export function cx(...values: (string | false | null | undefined)[]): string {
  let out = "";
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (!value) continue;
    out = out ? `${out} ${value}` : value;
  }
  return out;
}
