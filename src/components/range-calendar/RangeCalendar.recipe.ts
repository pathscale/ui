import { recipe } from "../../lib/layouts";
export const CLASSES = {
  Root: {
    base: "range-calendar",
    flag: {
      disabled: "range-calendar--disabled",
    },
  },
  Calendar: {
    base: "range-calendar__calendar",
  },
} as const;

export const componentRecipe = recipe({
  component: "range-calendar",
  slots: { "range-calendar": {}, root: {} },
});
