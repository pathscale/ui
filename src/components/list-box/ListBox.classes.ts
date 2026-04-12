export const CLASSES = {
  Root: {
    base: "list-box",
    variant: {
      default: "list-box--default",
      danger: "list-box--danger",
    },
  },
  Item: {
    base: "list-box-item",
    variant: {
      default: "list-box-item--default",
      danger: "list-box-item--danger",
    },
  },
  ItemIndicator: {
    base: "list-box-item__indicator",
  },
  Section: {
    base: "list-box-section",
    title: "list-box-section__title",
  },
} as const;
