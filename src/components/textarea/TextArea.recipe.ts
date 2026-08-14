import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "textarea",
  variant: {
    primary: "textarea--primary",
    secondary: "textarea--secondary",
  },
  flag: {
    fullWidth: "textarea--full-width",
  },
} as const;
export const componentRecipe = recipe({component:"textarea",slots:{"root":{},"textarea":{},},});
