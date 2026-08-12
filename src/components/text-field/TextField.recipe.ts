import { recipe } from "solid-layouts";

export const textField = recipe({
  component: "text-field",
  element: "div",
  slots: { root: { base: "text-field" } },
  props: {
    variant: {
      primary: "text-field--primary",
      secondary: "text-field--secondary",
    },
    fullWidth: { true: "text-field--full-width" },
  },
});
