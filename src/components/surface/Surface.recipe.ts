import { recipe } from "solid-layouts";

/**
 * Surface's design vocabulary.
 *
 * The class names are unchanged. What moves is the decision about which class
 * a value implies, out of the component body and into a declaration the
 * compiler can read.
 */
export const surface = recipe({
  component: "surface",
  element: "div",
  slots: { root: { base: "surface" } },
  props: {
    variant: {
      default: "surface--default",
      secondary: "surface--secondary",
      tertiary: "surface--tertiary",
      transparent: "surface--transparent",
    },
  },
});
