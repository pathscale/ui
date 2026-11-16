import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "toolbar",
  orientation: {
    horizontal: "toolbar--horizontal",
    vertical: "toolbar--vertical",
  },
  flag: {
    attached: "toolbar--attached",
  },
} as const;

const recipeDefinition = {component:"toolbar",slots:{"root":{},"toolbar":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
