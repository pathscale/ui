import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "color-slider",
  slot: {
    track: "color-slider__track",
    thumb: "color-slider__thumb",
  },
  flag: {
    alpha: "color-slider--alpha",
    dragging: "color-slider--dragging",
  },
} as const;
const recipeDefinition = {component:"color-slider",slots:{"color-slider":{},"color-slider-thumb":{},"color-slider-track":{},"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
