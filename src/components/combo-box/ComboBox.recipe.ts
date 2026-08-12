import { recipe } from "solid-layouts";

/**
 * `variant` and `fullWidth` each reached both the root and the group in the
 * old map, written out under both parts. Slot-keyed, each is one declaration.
 */
export const comboBox = recipe({
  component: "combo-box",
  element: "div",
  slots: {
    root: { base: "combo-box" },
    group: { base: "combo-box__input-group" },
    input: { base: "combo-box__input" },
  },
  props: {
    variant: {
      primary: { root: "combo-box--primary", group: "combo-box__input-group--primary" },
      secondary: { root: "combo-box--secondary", group: "combo-box__input-group--secondary" },
    },
    fullWidth: {
      true: { root: "combo-box--full-width", group: "combo-box__input-group--full-width" },
    },
  },
});
