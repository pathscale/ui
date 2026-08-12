import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "toolbar",
  orientation: {
    horizontal: "toolbar--horizontal",
    vertical: "toolbar--vertical",
  },
  flag: {
    attached: "toolbar--attached",
  },
} as const;

export const componentRecipe = recipe({component:"toolbar",slots:{"root":{},"toolbar":{},},});
