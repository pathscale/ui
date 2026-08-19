import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "join",
  flag: {
    vertical: "join-vertical",
    horizontal: "join-horizontal",
    responsive: "join-vertical lg:join-horizontal",
  },
} as const;
export const componentRecipe = recipe({
  component: "join",
  slots: { root: {} },
});
