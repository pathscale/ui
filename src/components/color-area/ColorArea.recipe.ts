import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "color-area",
  slot: {
    thumb: "color-area__thumb",
  },
} as const;
const recipeDefinition = {component:"color-area",slots:{"color-area":{},"color-area-thumb":{},"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
