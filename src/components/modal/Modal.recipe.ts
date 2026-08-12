import { recipe } from "solid-layouts";

/**
 * Modal's `scroll` and the animation phases are the clearest case in the
 * library for slot-keyed variants. `scroll` reaches the container, the
 * content and the body; `entering` and `exiting` reach the backdrop, the
 * container and the content. Each was written out separately under each part
 * in the old map, so one choice appeared three times and one phase appeared
 * three times, with nothing relating any of them.
 */
export const modal = recipe({
  component: "modal",
  element: "div",
  slots: {
    root: { base: "modal" },
    trigger: { base: "modal__trigger" },
    backdrop: { base: "modal__backdrop" },
    container: { base: "modal__container" },
    content: { base: "modal__content" },
    header: { base: "modal__header" },
    heading: { base: "modal__heading" },
    icon: { base: "modal__icon" },
    body: { base: "modal__body" },
    footer: { base: "modal__footer" },
    closeTrigger: { base: "modal__close-trigger" },
    closeTriggerIcon: { base: "modal__close-trigger-icon" },
  },
  props: {
    backdropVariant: {
      transparent: { backdrop: "modal__backdrop--transparent" },
      opaque: { backdrop: "modal__backdrop--opaque" },
      blur: { backdrop: "modal__backdrop--blur" },
    },
    scroll: {
      inside: {
        container: "modal__container--scroll-inside",
        content: "modal__content--scroll-inside",
        body: "modal__body--scroll-inside",
      },
      outside: {
        container: "modal__container--scroll-outside",
        content: "modal__content--scroll-outside",
        body: "modal__body--scroll-outside",
      },
    },
    size: {
      xs: { content: "modal__content--xs" },
      sm: { content: "modal__content--sm" },
      md: { content: "modal__content--md" },
      lg: { content: "modal__content--lg" },
      cover: {
        container: "modal__container--size-cover",
        content: "modal__content--cover",
      },
      full: {
        container: "modal__container--size-full",
        content: "modal__content--full",
      },
    },
  },
  state: {
    open: { true: "modal--open" },
    phase: {
      entering: {
        backdrop: "modal__backdrop--entering",
        container: "modal__container--entering",
        content: "modal__content--entering",
      },
      exiting: {
        backdrop: "modal__backdrop--exiting",
        container: "modal__container--exiting",
        content: "modal__content--exiting",
      },
    },
  },
});
