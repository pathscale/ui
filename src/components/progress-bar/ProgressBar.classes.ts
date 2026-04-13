export const CLASSES = {
  base: "progress-bar",
  label: "progress-bar__label",
  output: "progress-bar__output",
  track: "progress-bar__track",
  indicator: "progress-bar__indicator",
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
  state: {
    indeterminate: "progress-bar--indeterminate",
    disabled: "progress-bar--disabled",
  },
} as const;
