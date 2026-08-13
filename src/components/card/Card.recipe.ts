import { recipe } from "../../lib/layouts";

/**
 * Card absorbs Surface and GlassPanel.
 *
 * The old single `variant` conflated three unrelated things, which is why a
 * separate `shadow` prop grew beside it (17 sites of `shadow="xl"` against 26
 * of `variant="shadow"`). They are split so each axis means one thing:
 *
 *   variant    the fill treatment, shared with every other component
 *   elevation  how far off the page it sits
 *   material   what it is made of
 *
 * Fleet mapping: bordered=62 -> variant outline, shadow=26 -> elevation,
 * flat=6 -> variant plain, and GlassPanel's 50 sites -> material glass.
 *
 * GlassPanel also carried a collapsible header, chevron and content machinery.
 * Not one call site in 13 apps used any of it — only size (49), tone (7),
 * highlight (6) and interactive (1) — so it is dropped rather than ported.
 */
export const card = recipe({
  component: "card",
  element: "div",
  slots: { root: { base: "card" } },
  props: {
    variant: {
      solid: "card--solid",
      soft: "card--soft",
      outline: "card--outline",
      ghost: "card--ghost",
      plain: "card--plain",
    },
    material: {
      solid: "card--material-solid",
      glass: "card--material-glass",
    },
    elevation: {
      none: "card--elevation-none",
      sm: "card--elevation-sm",
      md: "card--elevation-md",
      lg: "card--elevation-lg",
    },
    flavor: {
      neutral: "card--flavor-neutral",
      primary: "card--flavor-primary",
      secondary: "card--flavor-secondary",
      accent: "card--flavor-accent",
    },
    state: {
      info: "card--state-info",
      success: "card--state-success",
      warning: "card--state-warning",
      danger: "card--state-danger",
    },
    padding: {
      none: "card--padding-none",
      xs: "card--padding-xs",
      sm: "card--padding-sm",
      md: "card--padding-md",
      lg: "card--padding-lg",
      xl: "card--padding-xl",
    },
    radius: {
      none: "card--radius-none",
      sm: "card--radius-sm",
      md: "card--radius-md",
      lg: "card--radius-lg",
      full: "card--radius-full",
    },
    isInteractive: { true: "card--interactive", false: "" },
  },
  defaults: {
    variant: "plain",
    material: "solid",
    elevation: "none",
    flavor: "neutral",
    padding: "md",
    radius: "lg",
  },
});

/**
 * The compound parts carry their own recipes rather than sharing the root's.
 *
 * A Layout must render every slot its recipe declares, so one shared recipe
 * would force each part to render all four. Their padding still comes from the
 * root, through descendant selectors keyed on `card--padding-*`, so the parts
 * stay in step without needing the root's props.
 */
export const cardHeader = recipe({
  component: "card-header",
  element: "div",
  slots: { root: { base: "card__header" } },
});

export const cardBody = recipe({
  component: "card-body",
  element: "div",
  slots: { root: { base: "card__body" } },
});

export const cardFooter = recipe({
  component: "card-footer",
  element: "div",
  slots: { root: { base: "card__footer" } },
});
