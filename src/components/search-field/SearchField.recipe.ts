import { recipe } from "solid-layouts";

/**
 * `fullWidth` was two entries in the old map, one on the root and one on the
 * group, because a flat map could not say that one choice reaches two
 * elements. Slot-keyed, it is one declaration.
 */
export const searchField = recipe({
  component: "search-field",
  element: "div",
  slots: {
    root: { base: "search-field" },
    group: { base: "search-field__group" },
    input: { base: "search-field__input" },
  },
  props: {
    variant: {
      primary: "search-field--primary",
      secondary: "search-field--secondary",
    },
    fullWidth: {
      true: {
        root: "search-field--full-width",
        group: "search-field__group--full-width",
      },
    },
  },
});
