export const CLASSES = {
  base: "chip",
  slot: {
    icon: "chip__icon",
    iconStart: "chip__icon--start",
    iconEnd: "chip__icon--end",
    label: "chip__label",
    remove: "chip__remove",
    removeIcon: "chip__remove-icon",
  },
  variant: {
    solid: "chip--solid",
    flat: "chip--flat",
    bordered: "chip--bordered",
  },
  color: {
    default: "chip--default",
    primary: "chip--primary",
    accent: "chip--accent",
    success: "chip--success",
    warning: "chip--warning",
    danger: "chip--danger",
  },
  size: {
    sm: "chip--sm",
    md: "chip--md",
    lg: "chip--lg",
  },
} as const;
