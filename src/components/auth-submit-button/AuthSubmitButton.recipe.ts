import { type Recipe, recipe } from "../../lib/layouts";

const authSubmitButtonDefinition = {
  component: "auth-submit-button",
  element: "button",
  slots: { root: { base: "auth-submit-button" } },
} as const;

export const authSubmitButton: Recipe<typeof authSubmitButtonDefinition> =
  recipe(authSubmitButtonDefinition);
