import { recipe } from "../../lib/layouts";
export const CLASSES = {
  Root: {
    base: "dialog",
    flag: {
      open: "dialog--open",
    },
  },
  Trigger: {
    base: "dialog__trigger",
  },
  Backdrop: {
    base: "dialog__backdrop",
    variant: {
      transparent: "dialog__backdrop--transparent",
      opaque: "dialog__backdrop--opaque",
      blur: "dialog__backdrop--blur",
    },
    state: {
      entering: "dialog__backdrop--entering",
      exiting: "dialog__backdrop--exiting",
    },
  },
  Container: {
    base: "dialog__container",
    placement: {
      auto: "dialog__container--auto",
      top: "dialog__container--top",
      center: "dialog__container--center",
      bottom: "dialog__container--bottom",
    },
    scroll: {
      inside: "dialog__container--scroll-inside",
      outside: "dialog__container--scroll-outside",
    },
    size: {
      cover: "dialog__container--size-cover",
      full: "dialog__container--size-full",
    },
    state: {
      entering: "dialog__container--entering",
      exiting: "dialog__container--exiting",
    },
  },
  Content: {
    base: "dialog__content",
    scroll: {
      inside: "dialog__content--scroll-inside",
      outside: "dialog__content--scroll-outside",
    },
    size: {
      xs: "dialog__content--xs",
      sm: "dialog__content--sm",
      md: "dialog__content--md",
      lg: "dialog__content--lg",
      cover: "dialog__content--cover",
      full: "dialog__content--full",
    },
    state: {
      entering: "dialog__content--entering",
      exiting: "dialog__content--exiting",
    },
  },
  Header: {
    base: "dialog__header",
  },
  Heading: {
    base: "dialog__heading",
  },
  Icon: {
    base: "dialog__icon",
  },
  Body: {
    base: "dialog__body",
    scroll: {
      inside: "dialog__body--scroll-inside",
      outside: "dialog__body--scroll-outside",
    },
  },
  Footer: {
    base: "dialog__footer",
  },
  CloseTrigger: {
    base: "dialog__close-trigger",
    icon: "dialog__close-trigger-icon",
  },
} as const;
export const componentRecipe = recipe({
  component: "dialog",
  slots: {
    "dialog-backdrop": {},
    "dialog-body": {},
    "dialog-close-trigger": {},
    "dialog-close-trigger-icon": {},
    "dialog-container": {},
    "dialog-content": {},
    "dialog-footer": {},
    "dialog-header": {},
    "dialog-heading": {},
    "dialog-icon": {},
    "dialog-root": {},
    "dialog-trigger": {},
    root: {},
  },
});
