import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "scroll-shadow",
  orientation: {
    vertical: "scroll-shadow--vertical",
    horizontal: "scroll-shadow--horizontal",
  },
  variant: {
    fade: "scroll-shadow--fade",
  },
  flag: {
    hideScrollBar: "scroll-shadow--hide-scrollbar",
  },
} as const;

export const componentRecipe = recipe({component:"scroll-shadow",slots:{"root":{},},});
