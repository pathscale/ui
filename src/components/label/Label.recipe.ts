import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "label",
  flag: {
    required: "label--required",
    disabled: "label--disabled",
    invalid: "label--invalid",
  },
} as const;
export const componentRecipe = recipe({
  component: "label",
  slots: { label: {}, root: {} },
});
