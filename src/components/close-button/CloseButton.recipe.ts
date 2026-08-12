import { recipe } from "solid-layouts";

export const closeButton = recipe({
  component: "close-button",
  element: "button",
  slots: {
    root: { base: "close-button" },
    icon: { base: "close-button__icon" },
    // Each carries the base icon class as well, because these are what the
    // layout renders — the old component composed the two by hand at every
    // call site, which is exactly the class composition a recipe exists to own.
    iconStart: { base: "close-button__icon close-button__icon--start" },
    iconEnd: { base: "close-button__icon close-button__icon--end" },
  },
  props: {
    variant: { default: "close-button--default" },
  },
  /**
   * Neither carries a class — the styling is the browser's `:disabled` — but
   * declaring them is what makes the runtime unwrap them for the layout and
   * mirror them to `data-disabled` and `data-pending`. The old component wrote
   * `data-pending` by hand.
   */
  state: {
    disabled: { true: "", false: "" },
    pending: { true: "", false: "" },
  },
});
