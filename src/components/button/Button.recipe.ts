import { recipe } from "solid-layouts";

/**
 * The component the library's implementation skeleton was written from, and
 * the last of the ninety to be ported.
 */
export const button = recipe({
  component: "button",
  element: "button",
  slots: {
    root: { base: "button" },
    spinner: { base: "button__spinner" },
    icon: { base: "button__icon" },
    iconStart: { base: "button__icon--start" },
    iconEnd: { base: "button__icon--end" },
  },
  props: {
    variant: {
      primary: "button--primary",
      secondary: "button--secondary",
      tertiary: "button--tertiary",
      outline: "button--outline",
      ghost: "button--ghost",
      danger: "button--danger",
      "danger-soft": "button--danger-soft",
    },
    size: { sm: "button--sm", md: "button--md", lg: "button--lg" },
    isIconOnly: { true: "button--icon-only" },
    fullWidth: { true: "button--full-width" },
  },
});
