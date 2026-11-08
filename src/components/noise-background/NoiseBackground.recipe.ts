import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "noise-background",
  flag: {
    backdropBlur: "noise-background--backdrop-blur",
  },
  slot: {
    layer0: "noise-background__layer noise-background__layer--0",
    layer1: "noise-background__layer noise-background__layer--1",
    layer2: "noise-background__layer noise-background__layer--2",
    strip: "noise-background__strip",
    noiseWrap: "noise-background__noise-wrap",
    noiseImage: "noise-background__noise-image",
    content: "noise-background__content",
  },
} as const;
const recipeDefinition = {component:"noise-background",slots:{"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
