import { recipe } from "solid-layouts";

/**
 * FieldError's design vocabulary.
 *
 * The class names are unchanged. What moves is the decision about which class
 * a value implies, out of the component body and into a declaration the
 * compiler can read.
 */
export const fieldError = recipe({
  component: "field-error",
  element: "p",
  slots: { root: { base: "field-error" } },
});
