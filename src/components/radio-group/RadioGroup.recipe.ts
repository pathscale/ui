import { recipe } from "solid-layouts";

export const radioGroup = recipe({
  component: "radio-group",
  element: "div",
  slots: {
    root: { base: "radio-group" },
    label: { base: "radio-group__label" },
    description: { base: "radio-group__description" },
    error: { base: "radio-group__error" },
    items: { base: "radio-group__items" },
  },
  props: {
    orientation: {
      vertical: "radio-group--vertical",
      horizontal: "radio-group--horizontal",
    },
    variant: {
      primary: "radio-group--primary",
      secondary: "radio-group--secondary",
    },
  },
  state: {
    disabled: { true: "radio-group--disabled" },
    invalid: { true: "radio-group--invalid" },
  },
});
