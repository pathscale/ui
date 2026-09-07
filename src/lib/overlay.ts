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
   * The element Tab must not leave, for an overlay that is modal.
   *
   * Omitted by a non-modal overlay -- a Popover does not take focus away from
   * the page -- and asked at key time, because the content is portalled and
   * mounts after registration.
   *
   * Here rather than on each component for the same reason `dismiss` is.
   * Dialog and Drawer each bound their own document-level Tab listener and
   * each gated it on "am I visible", so with both open both traps ran and the
   * one behind could pull focus out of the one in front. Which overlay owns
   * the keyboard is a question about all of them.
   */
  trapFocusIn?: () => HTMLElement | undefined;
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

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.defaultPrevented) return;

  const entry = top();
  if (!entry) return;

  if (event.key === "Tab") {
    const container = entry.trapFocusIn?.();
    if (container) trapFocus(event, container);
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
