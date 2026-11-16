import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  Root: {
    base: "fieldset",
  },
  Legend: {
    base: "fieldset__legend",
  },
  Group: {
    base: "fieldset__group",
  },
  Actions: {
    base: "fieldset__actions",
  },
} as const;
const recipeDefinition = {component:"fieldset",slots:{"fieldset":{},"fieldset-actions":{},"fieldset-field-group":{},"fieldset-legend":{},"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
