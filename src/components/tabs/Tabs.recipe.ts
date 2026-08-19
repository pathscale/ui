import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "tabs",
  slot: {
    listContainer: "tabs__list-container",
    list: "tabs__list",
    indicator: "tabs__indicator",
    tab: "tabs__tab",
    panel: "tabs__panel",
    separator: "tabs__separator",
  },
  variant: {
    secondary: "tabs--secondary",
  },
} as const;
export const componentRecipe = recipe({
  component: "tabs",
  slots: {
    root: {},
    tabs: {},
    "tabs-indicator": {},
    "tabs-list": {},
    "tabs-list-container": {},
    "tabs-panel": {},
    "tabs-separator": {},
    "tabs-tab": {},
  },
});
