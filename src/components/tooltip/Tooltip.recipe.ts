import { recipe } from "solid-layouts";

export const tooltip = recipe({
  component: "tooltip",
  element: "div",
  slots: {
    root: { base: "tooltip" },
    trigger: { base: "tooltip__trigger" },
    content: { base: "tooltip__content" },
    arrow: { base: "tooltip__arrow" },
  },
});
