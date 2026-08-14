import { recipe } from "../../lib/layouts";

/**
 * Flavor or state picks the accent; variant decides how it is spent.
 *
 * Flavor and state hold disjoint values and both write `--button-accent`,
 * with state declared second so it wins on source order. A condition
 * outranks a preference, so a destructive primary button reads destructive.
 *
 * flavor defaults to primary: <Button> is the call to action, which is what
 * the fleet's 215 primary call sites were already asking for.
 */
export const button = recipe({
  component: "button",
  element: "button",
  slots: {
    root: { base: "button" },
    spinner: { base: "button__spinner" },
    startIcon: { base: "button__icon button__icon--start" },
    endIcon: { base: "button__icon button__icon--end" },
  },
  props: {
    variant: {
      solid: "button--solid",
      soft: "button--soft",
      outline: "button--outline",
      ghost: "button--ghost",
      plain: "button--plain",
    },
    flavor: {
      neutral: "button--flavor-neutral",
      primary: "button--flavor-primary",
      secondary: "button--flavor-secondary",
      accent: "button--flavor-accent",
      destructive: "button--flavor-destructive",
      success: "button--flavor-success",
      warning: "button--flavor-warning",
      info: "button--flavor-info",
    },
    state: {
      default: "",
      loading: "button--state-loading",
      error: "button--state-error",
      invalid: "button--state-invalid",
      disabled: "button--state-disabled",
      hidden: "button--state-hidden",
    },
    size: {
      xs: "button--xs",
      sm: "button--sm",
      md: "button--md",
      lg: "button--lg",
      xl: "button--xl",
    },
    // `square` is where icon-only lives. The industry spells it `size="icon"`,
    // which collapses two axes into one: the fleet passes a size *and*
    // icon-only at most of its 465 call sites, so `size="icon"` would throw the
    // scale away at every one of them. Taking the industry's word is a
    // tie-breaker on naming, not a reason to lose information.
    width: {
      auto: "",
      full: "button--width-full",
      fit: "button--width-fit",
      screen: "button--width-screen",
      square: "button--width-square",
    },
    radius: {
      none: "button--radius-none",
      sm: "button--radius-sm",
      md: "button--radius-md",
      lg: "button--radius-lg",
      full: "button--radius-full",
    },
  },
  // `sm` rather than `md`: the fleet passes sm at 349 of 465 sites and md at 25.
  defaults: {
    variant: "solid",
    flavor: "primary",
    state: "default",
    size: "sm",
    width: "auto",
    radius: "full",
  },
});
