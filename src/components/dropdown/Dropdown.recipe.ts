import { recipe } from "solid-layouts";

export const dropdown = recipe({
  component: "dropdown",
  element: "div",
  slots: {
    root: { base: "dropdown" },
    trigger: { base: "dropdown__trigger" },
    popover: { base: "dropdown__popover" },
    menu: { base: "dropdown__menu" },
    item: { base: "dropdown__item" },
    group: { base: "dropdown__group" },
    separator: { base: "dropdown__separator" },
  },
});
