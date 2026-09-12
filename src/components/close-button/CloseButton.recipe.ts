import { recipe } from "../../lib/layouts";

export const componentRecipe = recipe({
  component: "close-button",
  element: "button",
  slots: {
    root: { base: "close-button" },
    startIcon: { base: "close-button__icon close-button__icon--start" },
    endIcon: { base: "close-button__icon close-button__icon--end" },
  },
  props: {
    variant: {
      default: "close-button--default",
    },
  },
  defaults: {
    variant: "default",
  },
});
