import { recipe } from "../../lib/layouts";

export const passwordField = recipe({
  component: "password-field",
  element: "div",
  slots: {
    root: { base: "password-field" },
    toggle: { base: "password-field__toggle" },
  },
});
