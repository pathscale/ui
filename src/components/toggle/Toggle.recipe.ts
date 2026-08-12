import { recipe } from "solid-layouts";

export const toggle = recipe({
  component: "toggle",
  element: "label",
  slots: {
    root: { base: "toggle" },
    input: { base: "toggle__input" },
    control: { base: "toggle__control" },
    thumb: { base: "toggle__thumb" },
    icon: { base: "toggle__icon" },
    content: { base: "toggle__content" },
    description: { base: "toggle__description" },
  },
  props: {
    color: {
      default: "toggle--default",
      accent: "toggle--accent",
      success: "toggle--success",
      warning: "toggle--warning",
      danger: "toggle--danger",
    },
    size: { sm: "toggle--sm", md: "toggle--md", lg: "toggle--lg" },
  },
  state: {
    disabled: { true: "toggle--disabled" },
  },
});
