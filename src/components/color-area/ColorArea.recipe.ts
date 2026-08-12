import { recipe } from "solid-layouts";

export const colorArea = recipe({
  component: "color-area",
  element: "div",
  slots: {
    root: { base: "color-area" },
    thumb: { base: "color-area__thumb" },
  },
});
