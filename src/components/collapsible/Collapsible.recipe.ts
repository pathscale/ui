import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "collapsible",
  slot: {
    heading: "collapsible__heading",
    trigger: "collapsible__trigger",
    indicator: "collapsible__indicator",
    content: "collapsible__content",
    body: "collapsible__body",
    bodyInner: "collapsible__body-inner",
  },
  flag: {
    expanded: "collapsible--expanded",
    disabled: "collapsible--disabled",
  },
} as const;
export const componentRecipe = recipe({
  component: "collapsible",
  slots: {
    collapsible: {},
    "collapsible-body": {},
    "collapsible-body-inner": {},
    "collapsible-content": {},
    "collapsible-heading": {},
    "collapsible-indicator": {},
    "collapsible-trigger": {},
    root: {},
  },
});
