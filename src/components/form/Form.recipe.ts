import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "form",
} as const;
export const componentRecipe = recipe({
  component: "form",
  slots: { "field-error-message": {}, form: {}, "form-field": {}, root: {} },
});
