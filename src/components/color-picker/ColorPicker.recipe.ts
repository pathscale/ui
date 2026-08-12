import { recipe } from "solid-layouts";

export const colorPicker = recipe({
  component: "color-picker",
  element: "div",
  slots: {
    root: { base: "color-picker" },
    area: { base: "color-picker__area" },
    slider: { base: "color-picker__slider" },
    field: { base: "color-picker__field" },
  },
});
