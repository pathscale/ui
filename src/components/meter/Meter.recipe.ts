import { recipe } from "solid-layouts";

export const meter = recipe({
  component: "meter",
  element: "div",
  slots: {
    root: { base: "meter" },
    output: { base: "meter__output" },
    track: { base: "meter__track" },
    fill: { base: "meter__fill" },
  },
  props: {
    size: { sm: "meter--sm", md: "meter--md", lg: "meter--lg" },
    color: {
      default: "meter--default",
      accent: "meter--accent",
      success: "meter--success",
      warning: "meter--warning",
      danger: "meter--danger",
    },
  },
  state: {
    disabled: { true: "meter--disabled" },
  },
});
