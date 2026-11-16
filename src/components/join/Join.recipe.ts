import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "join",
  flag: {
    vertical: "join-vertical",
    horizontal: "join-horizontal",
    responsive: "join-vertical lg:join-horizontal",
  },
} as const;
const recipeDefinition = {component:"join",slots:{"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
