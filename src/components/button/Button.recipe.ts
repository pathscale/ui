import { recipe } from "../../lib/layouts";

/**
 * Tone picks the accent; variant decides how the accent is used.
 *
 * Keeping them orthogonal means 8 tones and 5 variants cost 13 rules rather
 * than 40 combinations, because the variant rules read `--button-accent`
 * rather than naming a colour. It also makes combinations expressible that
 * the old single axis could not say at all, such as a soft warning button.
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
    tone: {
      neutral: "button--tone-neutral",
      primary: "button--tone-primary",
      secondary: "button--tone-secondary",
      accent: "button--tone-accent",
      success: "button--tone-success",
      warning: "button--tone-warning",
      danger: "button--tone-danger",
      info: "button--tone-info",
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
  defaults: { variant: "solid", tone: "neutral", size: "sm", width: "auto", radius: "full" },
});
