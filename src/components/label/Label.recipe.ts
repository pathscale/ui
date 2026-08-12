import { recipe } from "solid-layouts";

/**
 * The old `flag` map becomes `state`, which is where these belong: required,
 * disabled and invalid are computed rather than picked, and they now mirror
 * to `data-*` so a rule can select on them without a modifier class.
 */
export const label = recipe({
  component: "label",
  element: "label",
  slots: { root: { base: "label" } },
  state: {
    required: { true: "label--required" },
    disabled: { true: "label--disabled" },
    invalid: { true: "label--invalid" },
  },
});
