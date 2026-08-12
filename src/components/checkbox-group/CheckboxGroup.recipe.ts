import { recipe } from "solid-layouts";

export const checkboxGroup = recipe({
  component: "checkbox-group",
  element: "div",
  slots: { root: { base: "checkbox-group" } },
  props: {
    variant: {
      primary: "checkbox-group--primary",
      secondary: "checkbox-group--secondary",
    },
  },
  state: {
    disabled: { true: "checkbox-group--disabled" },
    invalid: { true: "checkbox-group--invalid" },
  },
});
