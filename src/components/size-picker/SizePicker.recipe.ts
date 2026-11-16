import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "inline-flex gap-1",
} as const;
const recipeDefinition = {component:"size-picker",slots:{"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
