import { recipe } from "../../lib/layouts";

/**
 * A callout reports a condition, so it takes `state` and nothing else.
 *
 * There is deliberately no separate colour axis: red is a consequence of
 * `state="danger"`, not an independent choice, and `<Callout state="success"
 * colour="red">` should be unsayable. The component was called `Alert`, which
 * named it after one of its own states — `status` was passed at 29 of 29 call
 * sites because "alert" was never a state it could default to.
 */
export const callout = recipe({
  component: "callout",
  element: "div",
  slots: {
    root: { base: "callout" },
    indicator: { base: "callout__indicator" },
    content: { base: "callout__content" },
    title: { base: "callout__title" },
    description: { base: "callout__description" },
    dismiss: { base: "callout__dismiss" },
  },
  props: {
    flavor: {
      neutral: "callout--flavor-neutral",
      primary: "callout--flavor-primary",
      secondary: "callout--flavor-secondary",
      accent: "callout--flavor-accent",
      destructive: "callout--flavor-destructive",
      success: "callout--flavor-success",
      warning: "callout--flavor-warning",
      info: "callout--flavor-info",
    },

    variant: {
      solid: "callout--solid",
      soft: "callout--soft",
      outline: "callout--outline",
      ghost: "callout--ghost",
      plain: "callout--plain",
    },
    // Every one of the 29 call sites in the fleet is inline, in content flow.
    // `banner` exists for the page-level case rather than a second component.
    placement: {
      inline: "callout--inline",
      banner: "callout--banner",
    },
  },
  defaults: { flavor: "neutral", variant: "soft", placement: "inline" },
});
