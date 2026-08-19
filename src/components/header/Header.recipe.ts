import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "header",
} as const;
export const componentRecipe = recipe({
  component: "header",
  slots: { header: {}, root: {} },
});
