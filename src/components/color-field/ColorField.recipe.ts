import { recipe } from "solid-layouts";

/**
 * The old `flag` map held four names that reached two different elements:
 * `fullWidth` and `disabled` on the root, `groupFullWidth` and `groupInvalid`
 * on the group. The `group` prefix in the name was the only thing carrying
 * that, so the same concept appeared twice under two spellings. Slot-keyed
 * variants let `fullWidth` reach both elements from one declaration.
 */
export const colorField = recipe({
  component: "color-field",
  element: "div",
  slots: {
    root: { base: "color-field" },
    group: { base: "color-field__group" },
    input: { base: "color-field__input" },
  },
  props: {
    fullWidth: {
      true: {
        root: "color-field--full-width",
        group: "color-field__group--full-width",
      },
    },
  },
  state: {
    disabled: { true: "color-field--disabled" },
    invalid: { true: { group: "color-field__group--invalid" } },
  },
});
