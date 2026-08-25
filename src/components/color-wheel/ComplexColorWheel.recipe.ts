import { recipe } from "../../lib/layouts";

export const complexColorWheel = recipe({
  component: "complex-color-wheel",
  slots: {
    root: { base: "complex-color-wheel" },
    adjustments: { base: "complex-color-wheel__adjustments" },
    action: { base: "complex-color-wheel__action" },
    axis: { base: "complex-color-wheel__axis" },
    axisHeading: { base: "complex-color-wheel__axis-heading" },
    axisControl: { base: "complex-color-wheel__axis-control" },
    stops: { base: "complex-color-wheel__stops" },
    stop: { base: "complex-color-wheel__stop" },
    stopPreview: { base: "complex-color-wheel__stop-preview" },
    preview: { base: "complex-color-wheel__preview" },
    hint: { base: "complex-color-wheel__hint" },
  },
  props: {
    /**
     * Where the adjustment rows sit relative to the wheel, and to each other.
     *
     * `beside` is the wide reading: the rows sit to the right of the wheel and
     * pack two to a line once there is room for them. `stacked` is the narrow
     * one, everything in a single column. `auto` picks by the width the
     * component is actually given rather than by the viewport, so a wheel in a
     * narrow panel stacks on a wide screen, which is the case that matters:
     * this lives in a side panel more often than on a page.
     */
    layout: {
      auto: "complex-color-wheel--layout-auto",
      beside: "complex-color-wheel--layout-beside",
      stacked: "complex-color-wheel--layout-stacked",
    },
  },
  defaults: { layout: "auto" },
});
