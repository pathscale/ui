import { recipe } from "solid-layouts";

export const chip = recipe({
  component: "chip",
  element: "span",
  slots: {
    root: { base: "chip" },
    icon: { base: "chip__icon" },
    iconStart: { base: "chip__icon--start" },
    iconEnd: { base: "chip__icon--end" },
    label: { base: "chip__label" },
    remove: { base: "chip__remove" },
    removeIcon: { base: "chip__remove-icon" },
  },
  props: {
    variant: {
      solid: "chip--solid",
      flat: "chip--flat",
      bordered: "chip--bordered",
    },
    color: {
      default: "chip--default",
      primary: "chip--primary",
      accent: "chip--accent",
      success: "chip--success",
      warning: "chip--warning",
      danger: "chip--danger",
    },
    size: {
      sm: "chip--sm",
      md: "chip--md",
      lg: "chip--lg",
    },
  },
});
