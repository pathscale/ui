import type { Layout } from "solid-layouts";

import type { text } from "./Text.recipe";

/**
 * Text's markup. The two `data-*` attributes are the styling hook, so they are
 * written here: the recipe mirrors state to attributes, and both of these are
 * presentation props.
 */
export const TextLayout: Layout<typeof text> = ({ slot, children }, props) => (
  <span
    {...slot.root}
    data-size={props.size as string}
    data-variant={props.variant as string}
  >
    {children}
  </span>
);
