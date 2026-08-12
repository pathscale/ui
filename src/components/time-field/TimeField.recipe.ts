import { recipe } from "solid-layouts";

/**
 * Shares the `date-input-group` element names with DateField, because the two
 * render the same segmented editor. `variant` and `fullWidth` each reach the
 * root and the group, as they do in every field component here.
 */
export const timeField = recipe({
  component: "time-field",
  element: "div",
  slots: {
    root: { base: "time-field" },
    group: { base: "date-input-group" },
    input: { base: "date-input-group__input" },
    inputContainer: { base: "date-input-group__input-container" },
    segment: { base: "date-input-group__segment" },
    prefix: { base: "date-input-group__prefix" },
  },
  props: {
    variant: {
      primary: {
        root: "time-field--primary",
        group: "date-input-group--primary",
      },
      secondary: {
        root: "time-field--secondary",
        group: "date-input-group--secondary",
      },
    },
    fullWidth: {
      true: {
        root: "time-field--full-width",
        group: "date-input-group--full-width",
      },
    },
  },
});
