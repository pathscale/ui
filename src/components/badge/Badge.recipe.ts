import { recipe } from "solid-layouts";

export const badge = recipe({
  component: "badge",
  element: "span",
  slots: {
    root: { base: "badge" },
    anchor: { base: "badge-anchor" },
    label: { base: "badge__label" },
  },
  props: {
    size: { sm: "badge--sm", md: "badge--md", lg: "badge--lg" },
    color: {
      default: "badge--default",
      accent: "badge--accent",
      success: "badge--success",
      warning: "badge--warning",
      danger: "badge--danger",
    },
    variant: {
      primary: "badge--primary",
      secondary: "badge--secondary",
      soft: "badge--soft",
    },
    placement: {
      "top-right": "badge--top-right",
      "top-left": "badge--top-left",
      "bottom-right": "badge--bottom-right",
      "bottom-left": "badge--bottom-left",
    },
  },
});
