import { recipe } from "solid-layouts";

/**
 * The old map listed `start`, `center` and `end` twice: once as bare slots
 * carrying two classes each, and again as a `section.variant` axis. They were
 * the same three things, and a caller reaching for one form got a different
 * shape than a caller reaching for the other.
 *
 * Here there is one `section` slot and one `align` axis.
 */
export const navbar = recipe({
  component: "navbar",
  element: "nav",
  slots: {
    root: { base: "navbar" },
    section: { base: "navbar__section" },
    stack: { base: "navbar__stack" },
    row: { base: "navbar__row" },
  },
  props: {
    align: {
      start: { section: "navbar__section--start" },
      center: { section: "navbar__section--center" },
      end: { section: "navbar__section--end" },
    },
    sticky: { true: { stack: "navbar__stack--sticky" } },
    container: { true: { stack: "navbar__stack--container" } },
  },
});
