import { recipe } from "../../lib/layouts";
export const CLASSES = {
  Root: {
    base: "button-group",
    orientation: {
      horizontal: "button-group--horizontal",
      vertical: "button-group--vertical",
    },
    flag: {
      fullWidth: "button-group--full-width",
    },
  },
  Separator: {
    base: "button-group__separator",
  },
} as const;
export const componentRecipe = recipe({
  component: "button-group",
  slots: { "button-group": {}, "button-group-separator": {}, root: {} },
});
