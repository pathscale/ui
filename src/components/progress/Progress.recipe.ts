import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "progress",
  label: "progress__label",
  output: "progress__output",
  track: "progress__track",
  indicator: "progress__indicator",
  size: {
    sm: "progress--sm",
    md: "progress--md",
    lg: "progress--lg",
  },
  flavor: {
    neutral: "progress--flavor-neutral",
    primary: "progress--flavor-primary",
    secondary: "progress--flavor-secondary",
    accent: "progress--flavor-accent",
    destructive: "progress--flavor-destructive",
    success: "progress--flavor-success",
    warning: "progress--flavor-warning",
    info: "progress--flavor-info",
  },
  state: {
    indeterminate: "progress--indeterminate",
    disabled: "progress--disabled",
  },
} as const;
export const componentRecipe = recipe({
  component: "progress",
  slots: { root: {} },
});
