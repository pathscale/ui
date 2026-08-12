import { recipe } from "solid-layouts";

/**
 * Drawer's old map nested `size` under `axis`, so the same four size names
 * appeared twice, once for a side drawer and once for an edge drawer. A
 * variant axis is one dimension, so the two are flattened here into names
 * that say which they are. That is a real API change rather than a
 * transcription, and it is the one component in this port where the recipe
 * could not simply mirror what was there.
 */
export const drawer = recipe({
  component: "drawer",
  element: "div",
  slots: {
    root: { base: "drawer" },
    trigger: { base: "drawer__trigger" },
    backdrop: { base: "drawer__backdrop" },
    content: { base: "drawer__content" },
    dialog: { base: "drawer__dialog" },
    header: { base: "drawer__header" },
    heading: { base: "drawer__heading" },
    body: { base: "drawer__body" },
    footer: { base: "drawer__footer" },
    handle: { base: "drawer__handle" },
    handleBar: { base: "drawer__handle-bar" },
    closeTrigger: { base: "drawer__close-trigger" },
    closeIcon: { base: "drawer__close-icon" },
    closeIconStart: { base: "drawer__close-icon--start" },
    closeIconEnd: { base: "drawer__close-icon--end" },
  },
  props: {
    backdropVariant: {
      opaque: { backdrop: "drawer__backdrop--opaque" },
      blur: { backdrop: "drawer__backdrop--blur" },
      transparent: { backdrop: "drawer__backdrop--transparent" },
    },
    axis: {
      side: { dialog: "drawer__dialog--axis-side" },
      edge: { dialog: "drawer__dialog--axis-edge" },
    },
    size: {
      "side-sm": { dialog: "drawer__dialog--side-sm" },
      "side-md": { dialog: "drawer__dialog--side-md" },
      "side-lg": { dialog: "drawer__dialog--side-lg" },
      "side-full": { dialog: "drawer__dialog--side-full" },
      "edge-sm": { dialog: "drawer__dialog--edge-sm" },
      "edge-md": { dialog: "drawer__dialog--edge-md" },
      "edge-lg": { dialog: "drawer__dialog--edge-lg" },
      "edge-full": { dialog: "drawer__dialog--edge-full" },
    },
    placement: {
      right: { content: "drawer__content--right" },
    },
    scroll: {
      inside: { content: "drawer__content--scroll-inside" },
      outside: { content: "drawer__content--scroll-outside" },
    },
  },
  state: {
    open: { true: "drawer--open" },
    phase: {
      entering: {
        root: "drawer--entering",
        content: "drawer__content--entering",
        dialog: "drawer__dialog--entering",
      },
      exiting: {
        root: "drawer--exiting",
        content: "drawer__content--exiting",
        dialog: "drawer__dialog--exiting",
      },
      closed: { root: "drawer--closed" },
    },
  },
});
