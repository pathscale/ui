import { recipe } from "solid-layouts";

export const tabs = recipe({
  component: "tabs",
  element: "div",
  slots: {
    root: { base: "tabs" },
    listContainer: { base: "tabs__list-container" },
    list: { base: "tabs__list" },
    indicator: { base: "tabs__indicator" },
    tab: { base: "tabs__tab" },
    panel: { base: "tabs__panel" },
    separator: { base: "tabs__separator" },
  },
  props: {
    variant: { secondary: "tabs--secondary" },
  },
});
