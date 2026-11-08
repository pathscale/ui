import { type Recipe, recipe } from "../../lib/layouts";

const recipeDefinition = {
  component: "close-button",
  element: "button",
  slots: {
    root: { base: "close-button" },
    startIcon: { base: "close-button__icon close-button__icon--start" },
    endIcon: { base: "close-button__icon close-button__icon--end" },
  },
  props: {
    variant: {
      default: "close-button--default",
    },
  },
  defaults: {
    variant: "default",
  },
} as const;

export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
