export const CLASSES = {
  navbar: {
    base: "navbar",
  },
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
    color: {
      ghost: "navbar__row--ghost",
      neutral: "navbar__row--neutral",
      primary: "navbar__row--primary",
      secondary: "navbar__row--secondary",
      accent: "navbar__row--accent",
      info: "navbar__row--info",
      success: "navbar__row--success",
      warning: "navbar__row--warning",
      error: "navbar__row--error",
    },
  },
} as const;
