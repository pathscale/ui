import { recipe } from "solid-layouts";

export const listBox = recipe({
  component: "list-box",
  element: "div",
  slots: {
    root: { base: "list-box" },
    item: { base: "list-box-item" },
    itemIndicator: { base: "list-box-item__indicator" },
    section: { base: "list-box-section" },
    sectionTitle: { base: "list-box-section__title" },
  },
  props: {
    variant: {
      default: { root: "list-box--default", item: "list-box-item--default" },
      danger: { root: "list-box--danger", item: "list-box-item--danger" },
    },
  },
});
