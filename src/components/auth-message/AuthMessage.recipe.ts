import { type Recipe, recipe } from "../../lib/layouts";

const authMessageDefinition = {
  component: "auth-message",
  element: "div",
  slots: { root: { base: "auth-message" } },
} as const;

export const authMessage: Recipe<typeof authMessageDefinition> =
  recipe(authMessageDefinition);
