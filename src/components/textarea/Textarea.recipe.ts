import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "textarea",
  variant: {
    primary: "textarea--primary",
    secondary: "textarea--secondary",
  },
  flag: {
    fullWidth: "textarea--full-width",
  },
} as const;
const recipeDefinition = {component:"textarea",slots:{"root":{},"textarea":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
