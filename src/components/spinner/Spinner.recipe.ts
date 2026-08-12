import { recipe } from "../../lib/layouts";

export const CLASSES = {
  base: "spinner",
  size: {
    xs: "spinner--xs",
    sm: "spinner--sm",
    md: "",
    lg: "spinner--lg",
    xl: "spinner--xl",
  },
  color: {
    current: "spinner--current",
    accent: "spinner--accent",
    success: "spinner--success",
    warning: "spinner--warning",
    danger: "spinner--danger",
  },
  variant: {
    spinner: "spinner--spinner",
    dots: "spinner--dots",
    ring: "spinner--ring",
    ball: "spinner--ball",
    bars: "spinner--bars",
    infinity: "spinner--infinity",
  },
} as const;

export const spinner = recipe({
  component: "spinner",
  element: "span",
  slots: { root: { base: CLASSES.base } },
  props: { size: CLASSES.size, color: CLASSES.color, variant: CLASSES.variant, label: {} },
  defaults: { size: "md", color: "current", variant: "spinner", label: "Loading" },
});
