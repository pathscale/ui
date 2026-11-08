import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "label",
  flag: {
    required: "label--required",
    disabled: "label--disabled",
    invalid: "label--invalid",
  },
} as const;
const recipeDefinition = {component:"label",slots:{"label":{},"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
