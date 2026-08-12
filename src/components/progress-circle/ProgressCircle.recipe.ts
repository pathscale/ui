import { recipe } from "solid-layouts";

export const progressCircle = recipe({
  component: "progress-circle",
  element: "div",
  slots: {
    root: { base: "progress-circle" },
    track: { base: "progress-circle__track" },
    trackCircle: { base: "progress-circle__track-circle" },
    indicator: { base: "progress-circle__indicator" },
  },
  props: {
    size: {
      sm: "progress-circle--sm",
      md: "progress-circle--md",
      lg: "progress-circle--lg",
    },
    color: {
      default: "progress-circle--default",
      accent: "progress-circle--accent",
      success: "progress-circle--success",
      warning: "progress-circle--warning",
      danger: "progress-circle--danger",
    },
  },
  state: {
    indeterminate: { true: "progress-circle--indeterminate" },
    disabled: { true: "progress-circle--disabled" },
  },
});
