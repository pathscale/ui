import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "separator",
  orientation: {
    horizontal: "separator--horizontal",
    vertical: "separator--vertical",
  },
  variant: {
    default: "separator--default",
    secondary: "separator--secondary",
    tertiary: "separator--tertiary",
  },
} as const;
export const componentRecipe = recipe({component:"separator",slots:{"root":{},"separator":{},},});
