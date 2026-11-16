import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  Root: {
    base: "range-calendar",
    flag: {
      disabled: "range-calendar--disabled",
    },
  },
  Calendar: {
    base: "range-calendar__calendar",
  },
} as const;

const recipeDefinition = {component:"range-calendar",slots:{"range-calendar":{},"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
