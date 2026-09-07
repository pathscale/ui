/**
 * One owner for the things overlapping overlays have to agree about.
 *
 * Dialog, Drawer and Popover each had their own copy of this, which is fine
 * until two of them are open at once, and then it is not:
 *
 * - **Escape closed every layer.** Each component bound its own `keydown` on
 *   `document`, and every listener that saw the key acted on it. Opening a
 *   Popover from inside a Dialog and pressing Escape dismissed both, because
 *   nothing established which overlay owned the event.
 *
 * - **The body could be left unscrollable for good.** Dialog and Drawer had
 *   *separate* module-scope lock counters, each saving `document.body.style
 *   .overflow` the first time it locked. Dialog opens and saves `""`. Drawer
 *   opens and saves `"hidden"` -- Dialog's value, not the page's. Dialog closes
 *   and restores `""`. Drawer closes and restores `"hidden"`. The page is now
 *   stuck, and nothing on screen says why.
 *
 * Components supply policy -- whether they are dismissable, what closing means
 * -- and this owns the mechanism.
 */

import { trapFocus } from "./focus";

type DismissReason = "escape";

interface OverlayEntry {
  dismiss: (reason: DismissReason) => void;
  /** Asked at dismiss time, not at registration: `closeOnEscape` can change. */
  dismissable: () => boolean;
  /**
   * This overlay's own content, asked at key time because it is portalled and
   * mounts after registration.
   *
   * Declared by modal and non-modal overlays alike. A Popover is not modal and
   * still has to be part of the focus scope of whatever it was opened from, or
   * Tab cannot reach it.
   */
  element?: () => HTMLElement | undefined;
  /**
   * Whether this overlay contains focus while it is open.
   *
   * True for Dialog and Drawer, false for Popover. It decides who *owns* the
   * scope; `element` decides what is *in* it.
   *
   * Here rather than on each component for the same reason `dismiss` is.
   * Dialog and Drawer each bound their own document-level Tab listener and
   * each gated it on "am I visible", so with both open both traps ran and the
   * one behind could pull focus out of the one in front. Which overlay owns
   * the keyboard is a question about all of them.
   */
  modal?: boolean;
}

/*
 * A stack, in the order overlays opened.
 *
 * Registration is on *open*, not on mount, and that distinction is the whole
 * point of the stack. Registering at setup made the order "whichever component
 * mounted last", which is not the order anything opened in: mount two
 * popovers, open the second and then the first, and Escape reached the second.
 * An entry gated on an `active()` predicate had the same flaw one step later --
 * it could skip the closed ones, but among the open ones it still ranked them
 * by mount.
 */
const stack: OverlayEntry[] = [];
let keydownBound = false;

/** The innermost overlay: the one that owns the keyboard. */
const top = (): OverlayEntry | undefined => stack[stack.length - 1];

/**
 * The elements Tab may move within, given what is open.
 *
 * The innermost *modal* owns the scope, and everything opened above it is
 * inside that scope. Empty when nothing open contains focus, which is Tab
 * belonging to the page.
 *
 * Asking only the top entry was wrong in the one arrangement this manager
 * exists for: a Popover opened from inside a Dialog is the top entry and is
 * not modal, so Tab did nothing at all and focus walked out to the page behind
 * a dialog that was still open -- worse than before the manager, where the
 * Dialog's own listener at least still ran. Trapping in the modal's element
 * alone is the opposite failure: the popover's portalled content sits outside
 * that element and Tab could never reach it.
 *
 * Exported for tests. This repository has no DOM in its unit tests -- the
 * harness is the DOM-level instrument -- and the bugs here are arrangements
 * rather than components, which is exactly what a one-component-per-page sweep
 * cannot set up. Keeping the decision pure is what makes it assertable at all.
 */
export const focusScope = (entries: readonly OverlayEntry[]): HTMLElement[] => {
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    if (!entries[i]?.modal) continue;
    return entries
      .slice(i)
      .map((entry) => entry.element?.())
      .filter((element): element is HTMLElement => Boolean(element));
  }
  return [];
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.defaultPrevented) return;

  const entry = top();
  if (!entry) return;

  if (event.key === "Tab") {
    const scope = focusScope(stack);
    if (scope.length > 0) trapFocus(event, scope);
    return;
  }

  if (event.key !== "Escape") return;
  /*
   * The topmost overlay owns Escape even when it refuses it.
   *
   * A confirmation dialog that declines to close must not let the Drawer
   * behind it close instead, which is what walking further down the stack
   * would do.
   */
  if (!entry.dismissable()) return;

  event.preventDefault();
  entry.dismiss("escape");
};

const bindKeyDown = () => {
  if (keydownBound || typeof document === "undefined") return;
  document.addEventListener("keydown", handleKeyDown);
  keydownBound = true;
};

const unbindKeyDown = () => {
  if (!keydownBound || stack.length > 0 || typeof document === "undefined") {
    return;
  }
  document.removeEventListener("keydown", handleKeyDown);
  keydownBound = false;
};

/**
 * Claim the keyboard while an overlay is open.
 *
 * Call this **when the overlay becomes visible**, not when the component
 * mounts, and call the returned function when it closes. The stack is the
 * order overlays opened in, and it can only be that if registration is.
 *
 * The most recently registered overlay owns Escape, and — when it declares
 * `trapFocusIn` — Tab.
 */
export const registerOverlay = (entry: OverlayEntry): (() => void) => {
  stack.push(entry);
  bindKeyDown();

  let released = false;
  return () => {
    if (released) return;
    released = true;
    const index = stack.lastIndexOf(entry);
    if (index !== -1) stack.splice(index, 1);
    unbindKeyDown();
  };
};

/** How many overlays currently own dismissal. Exposed for tests. */
export const overlayDepth = (): number => stack.length;

let lockCount = 0;
let restoreOverflow = "";
let restorePaddingRight = "";

/**
 * Hold the body still while an overlay is open.
 *
 * One counter for the whole library. The saved values are captured on the
 * first lock and restored on the last release, so overlapping overlays cannot
 * save each other's `hidden` and restore it afterwards.
 */
export const lockBodyScroll = (): (() => void) => {
  if (typeof document === "undefined") return () => {};

  if (lockCount === 0) {
    restoreOverflow = document.body.style.overflow;
    restorePaddingRight = document.body.style.paddingRight;

    // Compensate for the scrollbar the lock removes, or the page shifts
    // sideways as the overlay opens.
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (lockCount <= 0) return;
    lockCount -= 1;
    if (lockCount === 0) {
      document.body.style.overflow = restoreOverflow;
      document.body.style.paddingRight = restorePaddingRight;
    }
  };
};

/** Outstanding scroll locks. Exposed for tests. */
export const bodyScrollLockDepth = (): number => lockCount;
