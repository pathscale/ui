import { recipe } from "../../lib/layouts";
export const CLASSES = {
  navbar: { base: "navbar" },
  start: { base: "navbar__section navbar__section--start" },
  center: { base: "navbar__section navbar__section--center" },
  end: { base: "navbar__section navbar__section--end" },
  section: {
    base: "navbar__section",
    variant: {
      start: "navbar__section--start",
      center: "navbar__section--center",
      end: "navbar__section--end",
    },
  },
  stack: {
    base: "navbar__stack",
    flag: {
      sticky: "navbar__stack--sticky",
      container: "navbar__stack--container",
    },
  },
  row: {
    base: "navbar__row",
    flag: {
      bordered: "navbar__row--bordered",
      padded: "navbar__row--padded",
    },
    flavor: {
      neutral: "navbar__row--flavor-neutral",
      primary: "navbar__row--flavor-primary",
      secondary: "navbar__row--flavor-secondary",
      accent: "navbar__row--flavor-accent",
      destructive: "navbar__row--flavor-destructive",
      success: "navbar__row--flavor-success",
      warning: "navbar__row--flavor-warning",
      info: "navbar__row--flavor-info",
    },
    variant: {
      solid: "",
      ghost: "navbar__row--ghost",
    },
  },
} as const;
export const componentRecipe = recipe({component:"navbar",slots:{"root":{},},});
