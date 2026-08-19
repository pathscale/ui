import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "color-swatch-picker",
} as const;
export const componentRecipe = recipe({
  component: "color-swatch-picker",
  slots: { "color-swatch-picker": {}, root: {} },
});
