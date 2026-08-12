import { recipe } from "solid-layouts";

/**
 * Text's design vocabulary.
 *
 * The class names are unchanged. What moves is the decision about which class
 * a value implies, out of the component body and into a declaration the
 * compiler can read.
 */
export const text = recipe({
  component: "text",
  element: "span",
  slots: { root: { base: "text" } },
});
