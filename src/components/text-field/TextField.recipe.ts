import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "text-field",
  variant: {
    primary: "text-field--primary",
    secondary: "text-field--secondary",
  },
  flag: {
    fullWidth: "text-field--full-width",
  },
} as const;
export const componentRecipe = recipe({component:"text-field",slots:{"root":{},"textfield":{},},});
