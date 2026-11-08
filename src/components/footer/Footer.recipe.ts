import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "footer",
  title: "footer__title",
  flag: {
    center: "footer--center",
    horizontal: "footer--horizontal",
    vertical: "footer--vertical",
  },
} as const;
const recipeDefinition = {component:"footer",slots:{"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
