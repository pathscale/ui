import { recipe } from "solid-layouts";

/**
 * The old map had both `base: "popover"` and `slot.root: "popover-root"`,
 * two different names for two different elements with nothing saying which
 * was which. Declared as slots they are `root` and `surface`, and each
 * carries its own `data-slot`.
 */
export const popover = recipe({
  component: "popover",
  element: "div",
  slots: {
    root: { base: "popover-root" },
    surface: { base: "popover" },
    trigger: { base: "popover__trigger" },
    dialog: { base: "popover__dialog" },
    arrow: { base: "popover__arrow" },
    heading: { base: "popover__heading" },
  },
});
