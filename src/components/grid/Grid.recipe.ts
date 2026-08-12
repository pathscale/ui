import { recipe } from "solid-layouts";

/**
 * Grid is one of the four class maps in this library that emit real
 * Tailwind rather than BEM, so it declares `tailwind: true`. Every value here
 * is a utility, and a caller's `gap-8` genuinely contradicts the recipe's
 * `gap-4`; only a parse resolves that, which is what `twMerge` is for and why
 * the other sixty-odd recipes do not pay for it.
 */
export const grid = recipe({
  component: "grid",
  element: "div",
  tailwind: true,
  slots: { root: { base: "grid-layout" } },
  props: {
    cols: {
      "1": "grid-cols-1",
      "2": "grid-cols-2",
      "3": "grid-cols-3",
      "4": "grid-cols-4",
      "5": "grid-cols-5",
      "6": "grid-cols-6",
      "7": "grid-cols-7",
      "8": "grid-cols-8",
      "9": "grid-cols-9",
      "10": "grid-cols-10",
      "11": "grid-cols-11",
      "12": "grid-cols-12",
    },
    rows: {
      "1": "grid-rows-1",
      "2": "grid-rows-2",
      "3": "grid-rows-3",
      "4": "grid-rows-4",
      "5": "grid-rows-5",
      "6": "grid-rows-6",
      "7": "grid-rows-7",
      "8": "grid-rows-8",
      "9": "grid-rows-9",
      "10": "grid-rows-10",
      "11": "grid-rows-11",
      "12": "grid-rows-12",
    },
    flow: {
      "row": "grid-flow-row",
      "col": "grid-flow-col",
      "row-dense": "grid-flow-row-dense",
      "col-dense": "grid-flow-col-dense",
    },
    gap: {
      "none": "gap-0",
      "sm": "gap-2",
      "md": "gap-4",
      "lg": "gap-6",
      "xl": "gap-8",
    },
    autoCols: {
      "min": "auto-cols-min",
      "max": "auto-cols-max",
      "fr": "auto-cols-fr",
    },
    autoRows: {
      "min": "auto-rows-min",
      "max": "auto-rows-max",
      "fr": "auto-rows-fr",
    },
  },
});
