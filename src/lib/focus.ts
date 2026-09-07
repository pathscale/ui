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
 * Keep Tab inside a scope, wrapping at both ends.
 *
 * The scope is a list, not one element, because a modal's content is not
 * always one subtree: a Popover opened from inside a Dialog portals its
 * content elsewhere in the document, and it is still part of what the person
 * is looking at. Trapping in the Dialog's element alone would make the popover
 * unreachable by keyboard; treating the popover as the scope would let Tab
 * leave the modal behind it. Both belong.
 *
 * Order matters: the containers are given innermost-last, and the focusables
 * are concatenated in that order, so tabbing off the end of the newest overlay
 * wraps to the start of the modal that owns the scope.
 *
 * A scope with nothing focusable in it takes focus itself, so Tab cannot
 * escape a modal that is still loading its content.
 */
export const trapFocus = (
  event: KeyboardEvent,
  scope: HTMLElement | HTMLElement[],
) => {
  const containers = Array.isArray(scope) ? scope : [scope];
  const container = containers[0];
  if (!container) return;
  const nodes = containers.flatMap((element) => getFocusable(element));
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

  if (
    event.shiftKey &&
    (active === first || containers.some((element) => active === element))
  ) {
    event.preventDefault();
    last.focus();
  }

  /*
   * Focus outside the scope entirely is pulled back in.
   *
   * The two rules above only fire at the ends. They assume focus is already
   * inside, which is true when the modal placed it there and false the moment
   * anything else moves it -- a click on the page behind, a script focusing a
   * toast. Without this, Tab from outside walked the document with the modal
   * still open, which is the containment the pattern is named for.
   */
  if (active && !containers.some((element) => element.contains(active))) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  }
};
