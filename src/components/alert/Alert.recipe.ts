import { recipe } from "../../lib/layouts";

/**
 * A alert reports a condition, so it takes `state` and nothing else.
 *
 * There is deliberately no separate colour axis: red is a consequence of
 * `state="danger"`, not an independent choice, and `<Alert state="success"
 * colour="red">` should be unsayable. The component was called `Alert`, which
 * named it after one of its own states — `status` was passed at 29 of 29 call
 * sites because "alert" was never a state it could default to.
 */
export const alert = recipe({
  component: "alert",
  element: "div",
  slots: {
    root: { base: "alert" },
    indicator: { base: "alert__indicator" },
    content: { base: "alert__content" },
    title: { base: "alert__title" },
    description: { base: "alert__description" },
    dismiss: { base: "alert__dismiss" },
  },
  props: {
    flavor: {
      neutral: "alert--flavor-neutral",
      primary: "alert--flavor-primary",
      secondary: "alert--flavor-secondary",
      accent: "alert--flavor-accent",
      destructive: "alert--flavor-destructive",
      success: "alert--flavor-success",
      warning: "alert--flavor-warning",
      info: "alert--flavor-info",
    },

    variant: {
      solid: "alert--solid",
      soft: "alert--soft",
      outline: "alert--outline",
      ghost: "alert--ghost",
      plain: "alert--plain",
    },
    // Every one of the 29 call sites in the fleet is inline, in content flow.
    // `banner` exists for the page-level case rather than a second component.
    placement: {
      inline: "alert--inline",
      banner: "alert--banner",
    },
  },
  defaults: { flavor: "neutral", variant: "soft", placement: "inline" },
});
