import { recipe } from "solid-layouts";

export const skeleton = recipe({
  component: "skeleton",
  element: "div",
  slots: { root: { base: "skeleton" } },
  props: {
    animation: {
      shimmer: "skeleton--shimmer",
      pulse: "skeleton--pulse",
      none: "skeleton--none",
    },
  },
});
