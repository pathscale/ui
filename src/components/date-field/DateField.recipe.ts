import { recipe } from "solid-layouts";

/**
 * `variant` and `fullWidth` each reached both the root and the group in the
 * old map, written out under both parts. Slot-keyed, each is one declaration.
 */
export const dateField = recipe({
  component: "date-field",
  element: "div",
  slots: {
    root: { base: "date-field" },
    group: { base: "date-input-group" },
    input: { base: "date-field__input" },
  },
  props: {
    variant: {
      primary: { root: "date-field--primary", group: "date-input-group--primary" },
      secondary: { root: "date-field--secondary", group: "date-input-group--secondary" },
    },
    fullWidth: {
      true: { root: "date-field--full-width", group: "date-input-group--full-width" },
    },
  },
});
