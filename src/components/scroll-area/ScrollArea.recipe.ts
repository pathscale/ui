import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "scroll-area",
  orientation: {
    vertical: "scroll-area--vertical",
    horizontal: "scroll-area--horizontal",
  },
  variant: {
    fade: "scroll-area--fade",
  },
  flag: {
    hideScrollBar: "scroll-area--hide-scrollbar",
  },
} as const;

export const componentRecipe = recipe({
  component: "scroll-area",
  slots: { root: {} },
});
