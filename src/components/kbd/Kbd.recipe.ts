import { recipe } from "../../lib/layouts";
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
export const componentRecipe = recipe({
  component: "kbd",
  slots: { kbd: {}, "kbd-abbr": {}, "kbd-content": {}, root: {} },
});
