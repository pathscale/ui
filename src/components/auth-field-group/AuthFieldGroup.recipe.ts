import { type Recipe, recipe } from "../../lib/layouts";

const authFieldGroupDefinition = {
  component: "auth-field-group",
  element: "div",
  slots: { root: { base: "auth-field-group" } },
  props: {
    gap: {
      sm: "auth-field-group--sm",
      md: "auth-field-group--md",
      lg: "auth-field-group--lg",
    },
  },
  defaults: { gap: "md" },
} as const;

export const authFieldGroup: Recipe<typeof authFieldGroupDefinition> =
  recipe(authFieldGroupDefinition);
