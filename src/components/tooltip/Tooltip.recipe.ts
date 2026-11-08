import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "tooltip",
  slot: {
    trigger: "tooltip__trigger",
    content: "tooltip__content",
    arrow: "tooltip__arrow",
  },
} as const;
const recipeDefinition = {component:"tooltip",slots:{"root":{},"tooltip-arrow":{},"tooltip-arrow-svg":{},"tooltip-content":{},"tooltip-root":{},"tooltip-trigger":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
