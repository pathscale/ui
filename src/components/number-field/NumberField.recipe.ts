import { recipe } from "../../lib/layouts";
export const CLASSES = {
  Root: {
    base: "number-field",
    variant: {
      primary: "number-field--primary",
      secondary: "number-field--secondary",
    },
    flag: {
      fullWidth: "number-field--full-width",
    },
  },
  Group: {
    base: "number-field__group",
    flag: {
      fullWidth: "number-field__group--full-width",
    },
  },
  Input: {
    base: "number-field__input",
  },
  IncrementButton: {
    base: "number-field__increment-button",
  },
  DecrementButton: {
    base: "number-field__decrement-button",
  },
} as const;
export const componentRecipe = recipe({component:"number-field",slots:{"number-field":{},"number-field-decrement-button":{},"number-field-decrement-button-icon":{},"number-field-group":{},"number-field-increment-button":{},"number-field-increment-button-icon":{},"number-field-input":{},"root":{},},});
