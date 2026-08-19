import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "dropdown",
  slot: {
    trigger: "dropdown__trigger",
    popover: "dropdown__popover",
    menu: "dropdown__menu",
    item: "dropdown__item",
    group: "dropdown__group",
    separator: "dropdown__separator",
  },
} as const;
export const componentRecipe = recipe({component:"dropdown",slots:{"dropdown":{},"dropdown-group":{},"dropdown-menu":{},"dropdown-popover":{},"dropdown-trigger":{},"menu-item":{},"root":{},"separator":{},},});
