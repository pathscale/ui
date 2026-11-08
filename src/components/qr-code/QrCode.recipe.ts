import { type Recipe, recipe } from "../../lib/layouts";

const recipeDefinition = {
  component: "qr-code",
  element: "svg",
  slots: {
    root: { base: "qr-code" },
    modules: { base: "qr-code__modules" },
    "qr-code": {},
    "qr-code-modules": {},
  },
} as const;

export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
