import { type Recipe, recipe } from "../../lib/layouts";

const passwordFieldDefinition = {
  component: "password-field",
  element: "div",
  slots: {
    root: { base: "password-field" },
    toggle: { base: "password-field__toggle" },
  },
} as const;

export const passwordField: Recipe<typeof passwordFieldDefinition> =
  recipe(passwordFieldDefinition);
