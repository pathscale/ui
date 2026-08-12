import { recipe } from "solid-layouts";

export const colorSlider = recipe({
  component: "color-slider",
  element: "div",
  slots: {
    root: { base: "color-slider" },
    track: { base: "color-slider__track" },
    thumb: { base: "color-slider__thumb" },
  },
  props: {
    alpha: { true: "color-slider--alpha" },
  },
  state: {
    dragging: { true: "color-slider--dragging" },
  },
});
