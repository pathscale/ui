import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "kbd",
  variant: {
    default: "kbd--default",
    light: "kbd--light",
  },
  slot: {
    abbr: "kbd__abbr",
    content: "kbd__content",
  },
} as const;
const recipeDefinition = {component:"kbd",slots:{"kbd":{},"kbd-abbr":{},"kbd-content":{},"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
