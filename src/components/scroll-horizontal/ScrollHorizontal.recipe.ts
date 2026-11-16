import { type Recipe, recipe } from "../../lib/layouts";

const recipeDefinition = {
  component: "scroll-horizontal",
  slots: {
    root: { base: "scroll-horizontal" },
    viewport: { base: "scroll-horizontal__viewport" },
    track: { base: "scroll-horizontal__track" },
  },
} as const;

export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
