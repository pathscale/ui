import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "disclosure",
  slot: {
    heading: "disclosure__heading",
    trigger: "disclosure__trigger",
    indicator: "disclosure__indicator",
    content: "disclosure__content",
    body: "disclosure__body",
    bodyInner: "disclosure__body-inner",
  },
  flag: {
    expanded: "disclosure--expanded",
    disabled: "disclosure--disabled",
  },
} as const;
export const componentRecipe = recipe({component:"disclosure",slots:{"disclosure":{},"disclosure-body":{},"disclosure-body-inner":{},"disclosure-content":{},"disclosure-heading":{},"disclosure-indicator":{},"disclosure-trigger":{},"root":{},},});
