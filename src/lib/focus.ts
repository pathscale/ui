/**
 * Keyboard focus, for the overlays that have to contain it.
 *
 * Here rather than in a component's own module because two components had
 * their own copy of the same twenty lines -- Drawer's in `Drawer.a11y.ts` and
 * Dialog's written out inline -- and the overlay manager now needs it too. A
 * `lib` importing from a `components` directory to reach one of those copies
 * would be the layering inverted to avoid moving a helper.
 */

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

/** Everything inside `container` a person can Tab to, in document order. */
export const getFocusable = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (el) =>
      !el.hidden &&
      el.tabIndex >= 0 &&
      el.getAttribute("aria-hidden") !== "true",
  );

/** Move focus to the first thing inside `container` that will take it. */
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

/**
 * Keep Tab inside `container`, wrapping at both ends.
 *
 * Called by the overlay manager for the innermost overlay only. A container
 * with nothing focusable in it takes focus itself, so Tab cannot escape a
 * modal that is still loading its content.
 */
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
