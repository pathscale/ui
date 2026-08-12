import { recipe } from "solid-layouts";

export const checkbox = recipe({
  component: "checkbox",
  element: "label",
  slots: {
    root: { base: "checkbox" },
    input: { base: "checkbox__input" },
    control: { base: "checkbox__control" },
    indicator: { base: "checkbox__indicator" },
    content: { base: "checkbox__content" },
    description: { base: "checkbox__description" },
  },
  props: {
    variant: {
      primary: "checkbox--primary",
      secondary: "checkbox--secondary",
    },
  },
  state: {
    disabled: { true: "checkbox--disabled" },
  },
});
