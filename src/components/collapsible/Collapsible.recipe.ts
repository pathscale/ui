import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "collapsible",
  slot: {
    heading: "disclosure__heading",
    trigger: "disclosure__trigger",
    indicator: "disclosure__indicator",
    content: "disclosure__content",
    body: "disclosure__body",
    bodyInner: "disclosure__body-inner",
  },
  flag: {
    expanded: "collapsible--expanded",
    disabled: "collapsible--disabled",
  },
} as const;
export const componentRecipe = recipe({component:"collapsible",slots:{"collapsible":{},"collapsible-body":{},"collapsible-body-inner":{},"collapsible-content":{},"collapsible-heading":{},"collapsible-indicator":{},"collapsible-trigger":{},"root":{},},});
