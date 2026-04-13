export const CLASSES = {
  base: "toggle",
  slot: {
    input: "toggle__input",
    control: "toggle__control",
    thumb: "toggle__thumb",
    icon: "toggle__icon",
    content: "toggle__content",
    description: "toggle__description",
  },
  color: {
    default: "toggle--default",
    accent: "toggle--accent",
    success: "toggle--success",
    warning: "toggle--warning",
    danger: "toggle--danger",
  },
  size: {
    sm: "toggle--sm",
    md: "toggle--md",
    lg: "toggle--lg",
  },
  flag: {
    disabled: "toggle--disabled",
  },
} as const;
