import { recipe } from "solid-layouts";

/**
 * `size` names its classes `input-control--*`, so it sizes the control rather
 * than the root, and `fullWidthRoot` was the same choice spelled for a second
 * element. Both are slot-keyed here.
 */
export const input = recipe({
  component: "input",
  element: "div",
  slots: {
    root: { base: "input-root" },
    control: { base: "input-control" },
    field: { base: "input-field" },
    label: { base: "input-label" },
    helper: { base: "input-helper" },
    icon: { base: "input__icon" },
    iconStart: { base: "input__icon--start" },
    iconEnd: { base: "input__icon--end" },
  },
  props: {
    size: {
      sm: { control: "input-control--sm" },
      md: { control: "input-control--md" },
      lg: { control: "input-control--lg" },
    },
    fullWidth: { true: { root: "input-root--full-width" } },
  },
});
