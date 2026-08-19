import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "tooltip",
  slot: {
    trigger: "tooltip__trigger",
    content: "tooltip__content",
    arrow: "tooltip__arrow",
  },
} as const;
export const componentRecipe = recipe({
  component: "tooltip",
  slots: {
    root: {},
    "tooltip-arrow": {},
    "tooltip-arrow-svg": {},
    "tooltip-content": {},
    "tooltip-root": {},
    "tooltip-trigger": {},
  },
});
