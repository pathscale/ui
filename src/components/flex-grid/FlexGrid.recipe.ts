import { type Recipe, recipe } from "../../lib/layouts";

export const CLASSES = {
  base: "flex-grid",
  slot: {
    list: "flex-grid__list",
    more: "flex-grid__more",
  },
} as const;

const recipeDefinition = {
  component: "flex-grid",
  slots: { root: {}, "flex-grid-list": {}, "flex-grid-more": {} },
} as const;

export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
