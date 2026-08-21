import { recipe } from "../../lib/layouts";

export const CLASSES = {
  base: "flex-grid",
  slot: {
    list: "flex-grid__list",
    more: "flex-grid__more",
  },
} as const;

export const componentRecipe = recipe({
  component: "flex-grid",
  slots: { root: {}, "flex-grid-list": {}, "flex-grid-more": {} },
});
