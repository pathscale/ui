import { recipe } from "solid-layouts";

export const emptyState = recipe({
  component: "empty-state",
  element: "div",
  slots: {
    root: { base: "empty-state" },
    icon: { base: "empty-state__icon" },
    title: { base: "empty-state__title" },
    description: { base: "empty-state__description" },
    actions: { base: "empty-state__actions" },
  },
});
