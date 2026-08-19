import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "checkbox-group",
  variant: {
    primary: "checkbox-group--primary",
    secondary: "checkbox-group--secondary",
  },
  flag: {
    disabled: "checkbox-group--disabled",
    invalid: "checkbox-group--invalid",
  },
} as const;
export const componentRecipe = recipe({
  component: "checkbox-group",
  slots: { "checkbox-group": {}, root: {} },
});
