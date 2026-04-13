export const CLASSES = {
  slot: {
    trigger: "drawer__trigger",
    backdrop: "drawer__backdrop",
    content: "drawer__content",
    dialog: "drawer__dialog",
    header: "drawer__header",
    heading: "drawer__heading",
    body: "drawer__body",
    footer: "drawer__footer",
    handle: "drawer__handle",
    closeTrigger: "drawer__close-trigger",
    closeIcon: "drawer__close-icon",
  },
  backdrop: {
    opaque: "drawer__backdrop--opaque",
    blur: "drawer__backdrop--blur",
    transparent: "drawer__backdrop--transparent",
  },
  placement: {
    top: "drawer__content--top",
    bottom: "drawer__content--bottom",
    left: "drawer__content--left",
    right: "drawer__content--right",
  },
  closeIconStart: "drawer__close-icon--start",
  closeIconEnd: "drawer__close-icon--end",
} as const;
