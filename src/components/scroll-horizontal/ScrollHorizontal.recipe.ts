import { recipe } from "../../lib/layouts";

export const componentRecipe = recipe({
  component: "scroll-horizontal",
  slots: {
    root: { base: "scroll-horizontal" },
    viewport: { base: "scroll-horizontal__viewport" },
    track: { base: "scroll-horizontal__track" },
  },
});
