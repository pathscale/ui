import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "header",
} as const;
const recipeDefinition = {component:"header",slots:{"header":{},"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
