import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "glow-card",
  isolate: "glow-card--isolate",
} as const;
const recipeDefinition = {component:"glow-card",slots:{"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
