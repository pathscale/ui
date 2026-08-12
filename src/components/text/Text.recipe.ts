import { recipe } from "solid-layouts";

/**
 * Text is styled entirely from attribute selectors — `.text[data-size="lg"]`
 * rather than `.text--lg` — so both axes resolve to no class at all.
 *
 * They are still declared. The axis is what gives the prop a type, puts it
 * through the defaults cascade, and keeps it out of the plain-HTML bucket,
 * where `size` would have been written to the element as an attribute.
 */
export const text = recipe({
  component: "text",
  element: "span",
  slots: { root: { base: "text" } },
  props: {
    size: { xs: "", sm: "", base: "", lg: "", xl: "" },
    variant: { default: "", muted: "", success: "", warning: "", danger: "" },
  },
});
