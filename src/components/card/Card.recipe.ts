import { recipe } from "solid-layouts";

export const card = recipe({
  component: "card",
  element: "div",
  slots: {
    root: { base: "card" },
    header: { base: "card__header" },
    body: { base: "card__body" },
    footer: { base: "card__footer" },
  },
  props: {
    variant: {
      default: "card--default",
      flat: "card--flat",
      bordered: "card--bordered",
      shadow: "card--shadow",
    },
    isHoverable: { true: "card--hoverable" },
    isPressable: { true: "card--pressable" },
  },
});
