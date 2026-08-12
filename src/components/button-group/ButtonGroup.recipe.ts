import { recipe } from "solid-layouts";

export const buttonGroup = recipe({
  component: "button-group",
  element: "div",
  slots: {
    root: { base: "button-group" },
    separator: { base: "button-group__separator" },
  },
  props: {
    orientation: {
      horizontal: "button-group--horizontal",
      vertical: "button-group--vertical",
    },
    fullWidth: { true: "button-group--full-width" },
  },
});
