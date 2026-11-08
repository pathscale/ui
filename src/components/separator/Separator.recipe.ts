import { type Recipe, recipe } from "../../lib/layouts";
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
const recipeDefinition = {component:"separator",slots:{"root":{},"separator":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
