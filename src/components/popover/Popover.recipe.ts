import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "popover",
  slot: {
    root: "popover-root",
    trigger: "popover__trigger",
    dialog: "popover__dialog",
    arrow: "popover__arrow",
    heading: "popover__heading",
  },
} as const;
export const componentRecipe = recipe({component:"popover",slots:{"popover-arrow":{},"popover-arrow-svg":{},"popover-content":{},"popover-dialog":{},"popover-heading":{},"popover-root":{},"popover-trigger":{},"root":{},},});
