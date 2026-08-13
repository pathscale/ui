import { recipe } from "../../lib/layouts";

export const authFieldGroup = recipe({
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
});
