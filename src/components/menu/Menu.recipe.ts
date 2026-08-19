import { recipe } from "../../lib/layouts";
export const CLASSES = {
  Root: {
    base: "menu",
  },
  Item: {
    base: "menu-item",
    variant: {
      default: "menu-item--default",
      danger: "menu-item--danger",
    },
  },
  ItemIndicator: {
    base: "menu-item__indicator",
    submenu: "menu-item__indicator--submenu",
  },
  Section: {
    base: "menu-section",
    title: "menu-section__title",
  },
} as const;
export const componentRecipe = recipe({component:"menu",slots:{"heading":{},"menu":{},"menu-item":{},"menu-item-indicator":{},"menu-item-indicator--checkmark":{},"menu-item-indicator--dot":{},"menu-section":{},"root":{},"submenu-indicator":{},},});
