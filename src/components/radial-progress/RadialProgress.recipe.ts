import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "radial-progress",
  svg: "radial-progress__track",
  trackCircle: "radial-progress__track-circle",
  indicator: "radial-progress__indicator",
  size: {
    sm: "radial-progress--sm",
    md: "radial-progress--md",
    lg: "radial-progress--lg",
  },
  flavor: {
    neutral: "radial-progress--flavor-neutral",
    primary: "radial-progress--flavor-primary",
    secondary: "radial-progress--flavor-secondary",
    accent: "radial-progress--flavor-accent",
    destructive: "radial-progress--flavor-destructive",
    success: "radial-progress--flavor-success",
    warning: "radial-progress--flavor-warning",
    info: "radial-progress--flavor-info",
  },
  state: {
    indeterminate: "radial-progress--indeterminate",
    disabled: "radial-progress--disabled",
  },
} as const;
export const componentRecipe = recipe({
  component: "radial-progress",
  slots: { root: {} },
});
