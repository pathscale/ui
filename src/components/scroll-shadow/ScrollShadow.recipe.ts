import { recipe } from "solid-layouts";

export const scrollShadow = recipe({
  component: "scroll-shadow",
  element: "div",
  slots: { root: { base: "scroll-shadow" } },
  props: {
    orientation: {
      vertical: "scroll-shadow--vertical",
      horizontal: "scroll-shadow--horizontal",
    },
    variant: { fade: "scroll-shadow--fade" },
    hideScrollBar: { true: "scroll-shadow--hide-scrollbar" },
  },
});
