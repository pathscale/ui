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
});
