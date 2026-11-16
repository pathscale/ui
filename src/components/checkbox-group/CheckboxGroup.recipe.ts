import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "checkbox-group",
  variant: {
    primary: "checkbox-group--primary",
    secondary: "checkbox-group--secondary",
  },
  flag: {
    disabled: "checkbox-group--disabled",
    invalid: "checkbox-group--invalid",
  },
} as const;
const recipeDefinition = {component:"checkbox-group",slots:{"checkbox-group":{},"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
