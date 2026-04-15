export const CLASSES = {
  Root: {
    base: "drawer",
    state: {
      open: "drawer--open",
      entering: "drawer--entering",
      exiting: "drawer--exiting",
      closed: "drawer--closed",
    },
  },

  Trigger: {
    base: "drawer__trigger",
  },

  Backdrop: {
    base: "drawer__backdrop",
    variant: {
      opaque: "drawer__backdrop--opaque",
      blur: "drawer__backdrop--blur",
      transparent: "drawer__backdrop--transparent",
    },
    state: {
      entering: "drawer__backdrop--entering",
      exiting: "drawer__backdrop--exiting",
    },
  },

  Content: {
    base: "drawer__content",
    placement: {
      top: "drawer__content--top",
      bottom: "drawer__content--bottom",
      left: "drawer__content--left",
      right: "drawer__content--right",
    },
    scroll: {
      inside: "drawer__content--scroll-inside",
      outside: "drawer__content--scroll-outside",
    },
    state: {
      entering: "drawer__content--entering",
      exiting: "drawer__content--exiting",
    },
  },

  Dialog: {
    base: "drawer__dialog",
    axis: {
      side: "drawer__dialog--axis-side",
      edge: "drawer__dialog--axis-edge",
    },
    size: {
      side: {
        sm: "drawer__dialog--side-sm",
        md: "drawer__dialog--side-md",
        lg: "drawer__dialog--side-lg",
        full: "drawer__dialog--side-full",
      },
      edge: {
        sm: "drawer__dialog--edge-sm",
        md: "drawer__dialog--edge-md",
        lg: "drawer__dialog--edge-lg",
        full: "drawer__dialog--edge-full",
      },
    },
    state: {
      entering: "drawer__dialog--entering",
      exiting: "drawer__dialog--exiting",
    },
  },

  Header: { base: "drawer__header" },
  Heading: { base: "drawer__heading" },
  Body: { base: "drawer__body" },
  Footer: { base: "drawer__footer" },

  Handle: {
    base: "drawer__handle",
    bar: "drawer__handle-bar",
  },

  CloseTrigger: {
    base: "drawer__close-trigger",
    icon: "drawer__close-icon",
    iconStart: "drawer__close-icon--start",
    iconEnd: "drawer__close-icon--end",
  },
} as const;
