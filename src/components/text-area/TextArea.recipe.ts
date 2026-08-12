import { recipe } from "solid-layouts";

export const textArea = recipe({
  component: "textarea",
  element: "div",
  slots: { root: { base: "textarea" } },
  props: {
    variant: {
      primary: "textarea--primary",
      secondary: "textarea--secondary",
    },
    fullWidth: { true: "textarea--full-width" },
  },
});
