import { recipe } from "../../lib/layouts";

/**
 * `shape` rather than `variant`: the thing that varies here is the animation
 * (bars, dots, a ring), not emphasis, so it must not borrow the word that
 * means solid/soft/outline everywhere else. The fleet passed `bars` at 23 of
 * the 38 sites that used the old `Loading` alias.
 */
export const spinner = recipe({
  component: "spinner",
  element: "span",
  slots: { root: { base: "spinner" } },
  props: {
    size: {
      xs: "spinner--xs",
      sm: "spinner--sm",
      md: "spinner--md",
      lg: "spinner--lg",
      xl: "spinner--xl",
    },
    /* `flavor`, not `state`. These are colours, and nothing is ever "in the
       primary state" - which is why the old axis could not typecheck: its
       values were not members of `State`, including its own default. */
    flavor: {
      current: "spinner--flavor-current",
      neutral: "spinner--flavor-neutral",
      primary: "spinner--flavor-primary",
      secondary: "spinner--flavor-secondary",
      accent: "spinner--flavor-accent",
      success: "spinner--flavor-success",
      warning: "spinner--flavor-warning",
      destructive: "spinner--flavor-destructive",
      info: "spinner--flavor-info",
    },
    shape: {
      spinner: "spinner--spinner",
      dots: "spinner--dots",
      ring: "spinner--ring",
      ball: "spinner--ball",
      bars: "spinner--bars",
      infinity: "spinner--infinity",
    },
    label: {},
  },
  defaults: { size: "md", flavor: "current", shape: "spinner", label: "Loading" },
});
