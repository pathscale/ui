import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "radio-group",
  slot: {
    label: "radio-group__label",
    description: "radio-group__description",
    error: "radio-group__error",
    items: "radio-group__items",
  },
  orientation: {
    vertical: "radio-group--vertical",
    horizontal: "radio-group--horizontal",
  },
  variant: {
    primary: "radio-group--primary",
    secondary: "radio-group--secondary",
  },
  flag: {
    disabled: "radio-group--disabled",
    invalid: "radio-group--invalid",
  },
} as const;
export const componentRecipe = recipe({component:"radio-group",slots:{"description":{},"error-message":{},"label":{},"radio-group":{},"radio-group-items":{},"root":{},},});
