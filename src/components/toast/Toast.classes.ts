export const CLASSES = {
  Provider: {
    base: "toast-region",
    stack: "toast-region__stack",
    item: {
      base: "toast-region__item",
      placement: {
        bottom: "toast-region__item--bottom",
        bottomStart: "toast-region__item--bottom-start",
        bottomEnd: "toast-region__item--bottom-end",
        top: "toast-region__item--top",
        topStart: "toast-region__item--top-start",
        topEnd: "toast-region__item--top-end",
      },
      state: {
        hidden: "toast-region__item--hidden",
      },
    },
    placement: {
      bottom: "toast-region--bottom",
      bottomStart: "toast-region--bottom-start",
      bottomEnd: "toast-region--bottom-end",
      top: "toast-region--top",
      topStart: "toast-region--top-start",
      topEnd: "toast-region--top-end",
    },
  },
  Item: {
    base: "toast",
    variant: {
      default: "toast--default",
      accent: "toast--accent",
      success: "toast--success",
      warning: "toast--warning",
      danger: "toast--danger",
    },
    state: {
      frontmost: "toast--frontmost",
      hidden: "toast--hidden",
      entering: "toast--entering",
      exiting: "toast--exiting",
    },
  },
  Content: {
    base: "toast__content",
  },
  Indicator: {
    base: "toast__indicator",
    icon: "toast__icon",
  },
  Spinner: {
    base: "toast__spinner",
  },
  Title: {
    base: "toast__title",
  },
  Description: {
    base: "toast__description",
  },
  Action: {
    base: "toast__action",
  },
  Close: {
    base: "toast__close",
    icon: "toast__close-icon",
  },
} as const;
