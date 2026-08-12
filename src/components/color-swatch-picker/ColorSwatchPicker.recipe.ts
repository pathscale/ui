import { recipe } from "solid-layouts";

export const colorSwatchPicker = recipe({
  component: "color-swatch-picker",
  element: "div",
  slots: { root: { base: "color-swatch-picker" } },
});
