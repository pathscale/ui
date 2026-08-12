import { recipe } from "solid-layouts";

/**
 * Flex is one of the four class maps in this library that emit real
 * Tailwind rather than BEM, so it declares `tailwind: true`. Every value here
 * is a utility, and a caller's `gap-8` genuinely contradicts the recipe's
 * `gap-4`; only a parse resolves that, which is what `twMerge` is for and why
 * the other sixty-odd recipes do not pay for it.
 */
export const flex = recipe({
  component: "flex",
  element: "div",
  tailwind: true,
  slots: { root: { base: "flex-layout" } },
  props: {
    direction: {
      "row": "flex-row",
      "col": "flex-col",
      "row-reverse": "flex-row-reverse",
      "col-reverse": "flex-col-reverse",
    },
    justify: {
      "start": "justify-start",
      "center": "justify-center",
      "end": "justify-end",
      "between": "justify-between",
      "around": "justify-around",
      "evenly": "justify-evenly",
    },
    align: {
      "start": "items-start",
      "center": "items-center",
      "end": "items-end",
      "stretch": "items-stretch",
      "baseline": "items-baseline",
    },
    wrap: {
      "wrap": "flex-wrap",
      "nowrap": "flex-nowrap",
      "wrap-reverse": "flex-wrap-reverse",
    },
    gap: {
      "none": "gap-0",
      "sm": "gap-2",
      "md": "gap-4",
      "lg": "gap-6",
      "xl": "gap-8",
    },
    gapX: {
      "none": "gap-x-0",
      "sm": "gap-x-2",
      "md": "gap-x-4",
      "lg": "gap-x-6",
      "xl": "gap-x-8",
    },
    gapY: {
      "none": "gap-y-0",
      "sm": "gap-y-2",
      "md": "gap-y-4",
      "lg": "gap-y-6",
      "xl": "gap-y-8",
    },
    grow: {
      "true": "flex-grow",
      "false": "flex-grow-0",
    },
    shrink: {
      "true": "flex-shrink",
      "false": "flex-shrink-0",
    },
    basis: {
      "none": "basis-0",
      "sm": "basis-8",
      "md": "basis-16",
      "lg": "basis-24",
      "xl": "basis-32",
    },
  },
});
