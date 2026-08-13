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
    },
    state: {
      info: "button--state-info",
      success: "button--state-success",
      warning: "button--state-warning",
      danger: "button--state-danger",
    },
    size: {
      xs: "button--xs",
      sm: "button--sm",
      md: "button--md",
      lg: "button--lg",
      xl: "button--xl",
    },
    width: {
      auto: "",
      full: "button--width-full",
      fit: "button--width-fit",
      screen: "button--width-screen",
    },
    radius: {
      none: "button--radius-none",
      sm: "button--radius-sm",
      md: "button--radius-md",
      lg: "button--radius-lg",
      full: "button--radius-full",
    },
    isIconOnly: { true: "button--icon-only", false: "" },
  },
  // `sm` rather than `md`: the fleet passes sm at 349 of 465 sites and md at 25.
  defaults: { variant: "solid", flavor: "primary", size: "sm", width: "auto", radius: "full" },
});
