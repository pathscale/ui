import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "scroll-area",
  orientation: {
    vertical: "scroll-area--vertical",
    horizontal: "scroll-area--horizontal",
  },
  variant: {
    fade: "scroll-area--fade",
  },
  flag: {
    hideScrollBar: "scroll-area--hide-scrollbar",
  },
} as const;

const recipeDefinition = {component:"scroll-area",slots:{"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
