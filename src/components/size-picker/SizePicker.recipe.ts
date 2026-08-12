import { recipe } from "solid-layouts";

/**
 * One of the four class maps in this library that emit real Tailwind rather
 * than BEM, which is why this recipe declares `tailwind: true`. That selects
 * `twMerge` for the consumer's trailing class instead of a join, because with
 * Tailwind in play a caller's `gap-4` genuinely contradicts `gap-1` and only
 * a parse resolves it.
 */
export const sizePicker = recipe({
  component: "size-picker",
  element: "div",
  tailwind: true,
  slots: { root: { base: "inline-flex gap-1" } },
});
