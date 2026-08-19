import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "checkbox",
  slot: {
    input: "checkbox__input",
    control: "checkbox__control",
    indicator: "checkbox__indicator",
    content: "checkbox__content",
    description: "checkbox__description",
  },
  variant: {
    primary: "checkbox--primary",
    secondary: "checkbox--secondary",
  },
  flag: {
    disabled: "checkbox--disabled",
  },
} as const;
export const componentRecipe = recipe({
  component: "checkbox",
  slots: {
    checkbox: {},
    "checkbox-content": {},
    "checkbox-control": {},
    "checkbox-default-indicator--checkmark": {},
    "checkbox-default-indicator--indeterminate": {},
    "checkbox-indicator": {},
    "checkbox-input": {},
    description: {},
    label: {},
    root: {},
  },
});
