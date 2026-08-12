import { recipe } from "../../lib/layouts";

export const CLASSES = {
  base: "skeleton",
  animation: {
    shimmer: "skeleton--shimmer",
    pulse: "skeleton--pulse",
    none: "skeleton--none",
  },
} as const;

export const skeleton = recipe({
  component: "skeleton",
  element: "div",
  slots: { root: { base: CLASSES.base } },
  props: { animationType: CLASSES.animation },
  defaults: { animationType: "shimmer" },
});
