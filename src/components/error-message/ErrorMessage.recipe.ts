import { recipe } from "solid-layouts";

/**
 * ErrorMessage's design vocabulary.
 *
 * The class names are unchanged. What moves is the decision about which class
 * a value implies, out of the component body and into a declaration the
 * compiler can read.
 */
export const errorMessage = recipe({
  component: "error-message",
  element: "p",
  slots: { root: { base: "error-message" } },
});
