export const CLASSES = {
  base: "progress-circle",
  svg: "progress-circle__track",
  trackCircle: "progress-circle__track-circle",
  indicator: "progress-circle__indicator",
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
  state: {
    indeterminate: "progress-circle--indeterminate",
    disabled: "progress-circle--disabled",
  },
} as const;
