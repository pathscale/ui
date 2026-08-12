import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "surface",
  variant: {
    default: "surface--default",
    secondary: "surface--secondary",
    tertiary: "surface--tertiary",
    transparent: "surface--transparent",
  },
} as const;
export const componentRecipe = recipe({component:"surface",slots:{"root":{},"surface":{},},});
