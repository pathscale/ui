export const CLASSES = {
  Root: {
    base: "accordion",
    variant: {
      default: "accordion--default",
      surface: "accordion--surface",
    },
  },
  Item: {
    base: "accordion__item",
    flag: {
      expanded: "accordion__item--expanded",
      disabled: "accordion__item--disabled",
      hideSeparator: "accordion__item--hide-separator",
    },
  },
  Trigger: {
    base: "accordion__trigger",
  },
  Indicator: {
    base: "accordion__indicator",
    flag: {
      expanded: "accordion__indicator--expanded",
    },
  },
  Content: {
    base: "accordion__content",
    flag: {
      expanded: "accordion__content--expanded",
    },
  },
  Body: {
    base: "accordion__body",
  },
  BodyInner: {
    base: "accordion__body-inner",
  },
} as const;
