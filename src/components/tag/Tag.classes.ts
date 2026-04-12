export const CLASSES = {
  Root: {
    base: "tag",
    size: {
      sm: "tag--sm",
      md: "tag--md",
      lg: "tag--lg",
    },
    variant: {
      default: "tag--default",
      surface: "tag--surface",
    },
  },
  slot: {
    icon: "tag__icon",
    iconStart: "tag__icon--start",
    iconEnd: "tag__icon--end",
    removeButton: "tag__remove-button",
  },
} as const;
