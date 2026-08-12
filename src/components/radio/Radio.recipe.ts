import { recipe } from "solid-layouts";

export const radio = recipe({
  component: "radio",
  element: "label",
  slots: {
    root: { base: "radio" },
    input: { base: "radio__input" },
    control: { base: "radio__control" },
    indicator: { base: "radio__indicator" },
    content: { base: "radio__content" },
    description: { base: "radio__description" },
  },
  state: {
    disabled: { true: "radio--disabled" },
  },
});
