export type DrawerPlacement = "top" | "bottom" | "left" | "right";
export type DrawerSize = "sm" | "md" | "lg" | "full";
export type DrawerBackdropVariant = "opaque" | "blur" | "transparent";
export type DrawerScrollBehavior = "inside" | "outside";
export type DrawerAnimState = "entering" | "open" | "exiting" | "closed";
export type DrawerCloseReason = "escape" | "backdrop" | "trigger" | "api";

export const isSidePlacement = (placement: DrawerPlacement) =>
  placement === "left" || placement === "right";

export const isVisibleState = (state: DrawerAnimState) =>
  state === "entering" || state === "open";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export const getFocusable = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hidden && el.tabIndex >= 0 && el.getAttribute("aria-hidden") !== "true",
  );

export const focusFirst = (container: HTMLElement) => {
  const autofocus = container.querySelector<HTMLElement>("[autofocus]");
  if (autofocus) {
    autofocus.focus();
    return;
  }

  const nodes = getFocusable(container);
  if (nodes.length > 0) {
    nodes[0].focus();
    return;
  }

  container.focus();
};

export const trapFocus = (event: KeyboardEvent, container: HTMLElement) => {
  const nodes = getFocusable(container);
  if (nodes.length === 0) {
    event.preventDefault();
    container.focus();
    return;
  }

  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
    return;
  }

  if (event.shiftKey && (active === first || active === container)) {
    event.preventDefault();
    last.focus();
  }
};
