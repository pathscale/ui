import { recipe } from "solid-layouts";

export const inputGroup = recipe({
  component: "input-group",
  element: "div",
  slots: {
    root: { base: "input-group" },
    input: { base: "input-group__input" },
    prefix: { base: "input-group__prefix" },
    suffix: { base: "input-group__suffix" },
  },
  props: {
    variant: {
      primary: "input-group--primary",
      secondary: "input-group--secondary",
    },
    fullWidth: { true: "input-group--full-width" },
  },
});
