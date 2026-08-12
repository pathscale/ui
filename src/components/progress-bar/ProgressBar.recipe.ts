import { recipe } from "solid-layouts";

export const progressBar = recipe({
  component: "progress-bar",
  element: "div",
  slots: {
    root: { base: "progress-bar" },
    label: { base: "progress-bar__label" },
    output: { base: "progress-bar__output" },
    track: { base: "progress-bar__track" },
    indicator: { base: "progress-bar__indicator" },
  },
  props: {
    size: {
      sm: "progress-bar--sm",
      md: "progress-bar--md",
      lg: "progress-bar--lg",
    },
    color: {
      default: "progress-bar--default",
      accent: "progress-bar--accent",
      success: "progress-bar--success",
      warning: "progress-bar--warning",
      danger: "progress-bar--danger",
    },
  },
  state: {
    indeterminate: { true: "progress-bar--indeterminate" },
    disabled: { true: "progress-bar--disabled" },
  },
});
