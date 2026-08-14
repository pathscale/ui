import { recipe } from "../../lib/layouts";

/**
 * An icon takes its colour from a flavour like everything else.
 *
 * It declared `color` and never read it, so the prop typechecked and did
 * nothing: an icon asked for `color="danger"` came out the colour of its
 * parent's text. The flavour writes `--icon-accent` and the base rule spends
 * it, which is the same mechanism Button uses.
 *
 * `inherit` is the default and stays the common case. Most icons sit inside
 * something that has already chosen a colour, and an icon that ignored that
 * would be the wrong kind of opinionated.
 */
export const icon = recipe({
  component: "icon",
  element: "span",
  slots: { root: { base: "icon" } },
  props: {
    name: {},
    width: {},
    height: {},
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
