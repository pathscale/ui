import { recipe } from "../../lib/layouts";

/**
 * An icon, from either source, with the glyph itself left to the application.
 *
 * The library ships the box and the colour and nothing else. `glyph` is a
 * placeholder slot: it carries a stable class to style against, and the class
 * that actually paints the mark is added at the call boundary, either from the
 * token the consuming app's iconify build emitted or from the SVG the caller
 * handed in. Nothing here bakes a glyph into the package, which is why there is
 * no icon set in this recipe and no icon data in the shipped CSS.
 */
export const icon = recipe({
  component: "icon",
  element: "span",
  slots: {
    root: { base: "icon" },
    glyph: { base: "icon__glyph" },
  },
  props: {
    flavor: {
      inherit: "",
      neutral: "icon--flavor-neutral",
      primary: "icon--flavor-primary",
      secondary: "icon--flavor-secondary",
      accent: "icon--flavor-accent",
      destructive: "icon--flavor-destructive",
      success: "icon--flavor-success",
      warning: "icon--flavor-warning",
      info: "icon--flavor-info",
    },
  },
  defaults: { flavor: "inherit" },
});
