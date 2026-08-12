import { recipe } from "solid-layouts";

/**
 * `fullWidth` was two entries in the old map, one on the root and one on the
 * group, because a flat map could not say that one choice reaches two
 * elements. Slot-keyed, it is one declaration.
 */
export const numberField = recipe({
  component: "number-field",
  element: "div",
  slots: {
    root: { base: "number-field" },
    group: { base: "number-field__group" },
    input: { base: "number-field__input" },
  },
  props: {
    variant: {
      primary: "number-field--primary",
      secondary: "number-field--secondary",
    },
    fullWidth: {
      true: {
        root: "number-field--full-width",
        group: "number-field__group--full-width",
      },
    },
  },
});
