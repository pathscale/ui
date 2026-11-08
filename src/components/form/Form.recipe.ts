import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "form",
} as const;
const recipeDefinition = {component:"form",slots:{"field-error-message":{},"form":{},"form-field":{},"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
