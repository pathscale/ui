export const CLASSES = {
  Root: {
    base: "modal",
    flag: {
      open: "modal--open",
    },
  },
  Trigger: {
    base: "modal__trigger",
  },
  Backdrop: {
    base: "modal__backdrop",
    variant: {
      transparent: "modal__backdrop--transparent",
      opaque: "modal__backdrop--opaque",
      blur: "modal__backdrop--blur",
    },
    state: {
      entering: "modal__backdrop--entering",
      exiting: "modal__backdrop--exiting",
    },
  },
  Container: {
    base: "modal__container",
    placement: {
      auto: "modal__container--auto",
      top: "modal__container--top",
      center: "modal__container--center",
      bottom: "modal__container--bottom",
    },
    scroll: {
      inside: "modal__container--scroll-inside",
      outside: "modal__container--scroll-outside",
    },
    size: {
      cover: "modal__container--size-cover",
      full: "modal__container--size-full",
    },
    state: {
      entering: "modal__container--entering",
      exiting: "modal__container--exiting",
    },
  },
  Content: {
    base: "modal__content",
    scroll: {
      inside: "modal__content--scroll-inside",
      outside: "modal__content--scroll-outside",
    },
    size: {
      xs: "modal__content--xs",
      sm: "modal__content--sm",
      md: "modal__content--md",
      lg: "modal__content--lg",
      cover: "modal__content--cover",
      full: "modal__content--full",
    },
    state: {
      entering: "modal__content--entering",
      exiting: "modal__content--exiting",
    },
  },
  Header: {
    base: "modal__header",
  },
  Heading: {
    base: "modal__heading",
  },
  Icon: {
    base: "modal__icon",
  },
  Body: {
    base: "modal__body",
    scroll: {
      inside: "modal__body--scroll-inside",
      outside: "modal__body--scroll-outside",
    },
  },
  Footer: {
    base: "modal__footer",
  },
  CloseTrigger: {
    base: "modal__close-trigger",
    icon: "modal__close-trigger-icon",
  },
} as const;
