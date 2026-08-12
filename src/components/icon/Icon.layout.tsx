import type { JSX } from "solid-js";
import type { Layout } from "solid-layouts";

import type { icon } from "./Icon.recipe";

/**
 * Icon's markup: an empty span, sized by the style the wrapper composed, whose
 * glyph comes from the iconify class the caller names.
 */
export const IconLayout: Layout<typeof icon> = ({ slot }, props) => (
  <span
    {...slot.root}
    style={props.style as JSX.CSSProperties}
  />
);
