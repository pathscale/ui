import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "color-swatch-picker",
} as const;
const recipeDefinition = {component:"color-swatch-picker",slots:{"color-swatch-picker":{},"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
