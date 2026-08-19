import { recipe } from "../../lib/layouts";

/**
 * Skeleton had no API at all: 340 call sites across 3 apps, every one styled
 * by `class`, and not one declared parameter ever passed anywhere in the
 * fleet. Its size and shape are the whole point of it, and it had neither.
 */
export const skeleton = recipe({
  component: "skeleton",
  element: "div",
  slots: {
    root: { base: "skeleton" },
    line: { base: "skeleton__line" },
  },
  props: {
    shape: {
      line: "skeleton--line",
      circle: "skeleton--circle",
      rect: "skeleton--rect",
    },
    width: {
      auto: "",
      full: "skeleton--width-full",
      fit: "skeleton--width-fit",
      screen: "skeleton--width-screen",
    },
    size: {
      xs: "skeleton--xs",
      sm: "skeleton--sm",
      md: "skeleton--md",
      lg: "skeleton--lg",
      xl: "skeleton--xl",
    },
    radius: {
      none: "skeleton--radius-none",
      sm: "skeleton--radius-sm",
      md: "skeleton--radius-md",
      lg: "skeleton--radius-lg",
      full: "skeleton--radius-full",
    },
    animation: {
      shimmer: "skeleton--shimmer",
      pulse: "skeleton--pulse",
      none: "skeleton--none",
    },
  },
  defaults: {
    shape: "line",
    width: "full",
    size: "md",
    radius: "sm",
    animation: "shimmer",
  },
});
