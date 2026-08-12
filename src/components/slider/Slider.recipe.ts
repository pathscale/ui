import { recipe } from "solid-layouts";

export const slider = recipe({
  component: "slider",
  element: "div",
  slots: {
    root: { base: "slider" },
    label: { base: "slider__label" },
    output: { base: "slider__output" },
    track: { base: "slider__track" },
    fill: { base: "slider__fill" },
    thumb: { base: "slider__thumb" },
  },
  props: {
    size: { sm: "slider--sm", md: "slider--md", lg: "slider--lg" },
  },
});
