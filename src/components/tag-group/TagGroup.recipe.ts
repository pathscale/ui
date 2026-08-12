import { recipe } from "../../lib/layouts";
export const CLASSES = {
  Root: {
    base: "tag-group",
  },
  List: {
    base: "tag-group__list",
  },
} as const;
export const componentRecipe = recipe({component:"tag-group",slots:{"root":{},"tag-group":{},"tag-group-list":{},},});
