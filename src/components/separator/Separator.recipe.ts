import { recipe } from "solid-layouts";

/**
 * Separator's design vocabulary.
 *
 * The classes are unchanged; what moves is the decision about which class a
 * value implies, from `Separator.tsx` into a declaration. `orientation` and
 * `variant` were also written out by hand as `data-` attributes on the
 * element, and are now mirrored by the recipe from the same declaration, so
 * the class and the attribute cannot disagree.
 */
export const separator = recipe({
  component: "separator",
  element: "div",
  slots: { root: { base: "separator" } },
  props: {
    orientation: {
      horizontal: "separator--horizontal",
      vertical: "separator--vertical",
    },
    variant: {
      default: "separator--default",
      secondary: "separator--secondary",
      tertiary: "separator--tertiary",
    },
  },
});
