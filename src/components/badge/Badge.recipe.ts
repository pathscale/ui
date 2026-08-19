import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "badge",
  slot: {
    anchor: "badge-anchor",
    label: "badge__label",
  },
  size: {
    sm: "badge--sm",
    md: "badge--md",
    lg: "badge--lg",
  },
  flavor: {
    neutral: "badge--flavor-neutral",
    primary: "badge--flavor-primary",
    secondary: "badge--flavor-secondary",
    accent: "badge--flavor-accent",
    destructive: "badge--flavor-destructive",
    success: "badge--flavor-success",
    warning: "badge--flavor-warning",
    info: "badge--flavor-info",
  },
  variant: {
    solid: "badge--variant-solid",
    soft: "badge--variant-soft",
    outline: "badge--variant-outline",
  },
  state: {
    default: "",
    loading: "badge--loading",
    error: "badge--error",
    invalid: "badge--invalid",
    disabled: "badge--disabled",
    hidden: "badge--hidden",
  },
  placement: {
    "top-right": "badge--top-right",
    "top-left": "badge--top-left",
    "bottom-right": "badge--bottom-right",
    "bottom-left": "badge--bottom-left",
  },
} as const;
export const componentRecipe = recipe({
  component: "badge",
  slots: { badge: {}, "badge-anchor": {}, "badge-label": {}, root: {} },
});
