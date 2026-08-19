import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "footer",
  title: "footer__title",
  flag: {
    center: "footer--center",
    horizontal: "footer--horizontal",
    vertical: "footer--vertical",
  },
} as const;
export const componentRecipe = recipe({
  component: "footer",
  slots: { root: {} },
});
