import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  mirror: "-scale-x-100",
} as const;
const recipeDefinition = {component:"video-preview",slots:{"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
