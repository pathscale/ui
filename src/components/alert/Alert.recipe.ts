import { recipe } from "solid-layouts";

export const alert = recipe({
  component: "alert",
  element: "div",
  slots: {
    root: { base: "alert" },
    indicator: { base: "alert__indicator" },
    content: { base: "alert__content" },
    title: { base: "alert__title" },
    description: { base: "alert__description" },
  },
  props: {
    status: {
      default: "alert--default",
      accent: "alert--accent",
      success: "alert--success",
      warning: "alert--warning",
      danger: "alert--danger",
    },
  },
});
