import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "slider",
  label: "slider__label",
  output: "slider__output",
  track: "slider__track",
  fill: "slider__fill",
  thumb: "slider__thumb",
  size: {
    sm: "slider--sm",
    md: "slider--md",
    lg: "slider--lg",
  },
} as const;
const recipeDefinition = {component:"slider",slots:{"label":{},"root":{},"slider":{},"slider-fill":{},"slider-output":{},"slider-thumb":{},"slider-track":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
