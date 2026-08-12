import type { JSX } from "solid-js";
import type { Layout } from "solid-layouts";

import type { icon } from "./Icon.recipe";

/**
 * Icon's markup: an empty span whose glyph is a class and whose size is a
 * style.
 *
 * The class is joined here rather than resolved by the recipe because the
 * value is open-ended — every icon in iconify — and a recipe axis enumerates.
 * This is the one place a layout composes a class, and it composes with the
 * recipe's rather than replacing it.
 */
export const IconLayout: Layout<typeof icon> = ({ slot }, props) => (
  <span
    {...slot.root}
    class={[slot.root.class, props.iconClass].filter(Boolean).join(" ")}
    style={{
      ...(props.box as JSX.CSSProperties),
      ...(typeof props.style === "object"
        ? (props.style as JSX.CSSProperties)
        : {}),
    }}
  />
);
