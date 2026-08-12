import { recipe } from "solid-layouts";

export const closeButton = recipe({
  component: "close-button",
  element: "button",
  slots: {
    root: { base: "close-button" },
    icon: { base: "close-button__icon" },
    iconStart: { base: "close-button__icon--start" },
    iconEnd: { base: "close-button__icon--end" },
  },
  props: {
    variant: { default: "close-button--default" },
  },
});
