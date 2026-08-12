import { recipe } from "solid-layouts";

export const footer = recipe({
  component: "footer",
  element: "footer",
  slots: {
    root: { base: "footer" },
    title: { base: "footer__title" },
  },
  props: {
    center: { true: "footer--center" },
    direction: {
      horizontal: "footer--horizontal",
      vertical: "footer--vertical",
    },
  },
});
