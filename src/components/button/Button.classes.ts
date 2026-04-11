export const CLASSES = {
  base: "button",
  variant: {
    primary: "button--primary",
    secondary: "button--secondary",
    tertiary: "button--tertiary",
    outline: "button--outline",
    ghost: "button--ghost",
    danger: "button--danger",
    "danger-soft": "button--danger-soft",
  },
  size: {
    sm: "button--sm",
    md: "button--md",
    lg: "button--lg",
  },
  flag: {
    isIconOnly: "button--icon-only",
    fullWidth: "button--full-width",
  },
  slot: {
    spinner: "button__spinner",
    icon: "button__icon",
    iconStart: "button__icon--start",
    iconEnd: "button__icon--end",
  },
} as const;
