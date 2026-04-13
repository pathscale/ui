export const CLASSES = {
  base: "avatar",
  slot: {
    image: "avatar__image",
    fallback: "avatar__fallback",
  },
  size: {
    sm: "avatar--sm",
    md: "",
    lg: "avatar--lg",
  },
  variant: {
    default: "",
    soft: "avatar--soft",
  },
  color: {
    default: "avatar__fallback--default",
    accent: "avatar__fallback--accent",
    success: "avatar__fallback--success",
    warning: "avatar__fallback--warning",
    danger: "avatar__fallback--danger",
  },
  group: {
    base: "avatar-group",
    overlap: "-space-x-6",
  },
} as const;
