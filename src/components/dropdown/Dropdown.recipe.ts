import { recipe } from "../../lib/layouts";
export const CLASSES = {
  // `ui-overlay-host` is the shared containing block every non-portaled overlay
  // needs; see `_shared/overlayHost.css`. Without it the fixed menu paints
  // outside this box and takes no pointer events.
  base: "dropdown ui-overlay-host",
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
