import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "color-area",
  slot: {
    thumb: "color-area__thumb",
  },
} as const;
export const componentRecipe = recipe({
  component: "color-area",
  slots: { "color-area": {}, "color-area-thumb": {}, root: {} },
});
