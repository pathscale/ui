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

type DismissReason = "escape";

interface OverlayEntry {
  dismiss: (reason: DismissReason) => void;
  /** Asked at dismiss time, not at registration: `closeOnEscape` can change. */
  dismissable: () => boolean;
  /**
   * Whether this overlay is on screen right now.
   *
   * Registration lasts as long as the component, because all three of these
   * bind their listeners once and gate inside the handler. Without this a
   * *closed* Popover would sit on top of the stack and swallow the Escape
   * meant for the Dialog behind it -- trading "closes everything" for "closes
   * nothing", which is not an improvement.
   */
  active: () => boolean;
}

/*
 * A stack, because dismissal is last-opened-first.
 *
 * Registration order is open order, so the top of the stack is the innermost
 * overlay. Only it is offered the key.
 */
const stack: OverlayEntry[] = [];
let keydownBound = false;

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key !== "Escape") return;
  if (event.defaultPrevented) return;

  /*
   * The topmost *visible* entry, and then only if it accepts.
   *
   * Two separate rules, and the order matters. Closed overlays are skipped,
   * because registration outlives visibility. But a visible overlay that
   * refuses Escape still *owns* it: a confirmation dialog that declines to
   * close must not let the Drawer behind it close instead, which is what
   * continuing the search would do. So the scan stops at the first visible
   * entry and asks only that one.
   */
  let top: OverlayEntry | undefined;
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    const entry = stack[i];
    if (entry?.active()) {
      top = entry;
      break;
    }
  }
  if (!top) return;
  if (!top.dismissable()) return;

  event.preventDefault();
  top.dismiss("escape");
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
 * Claim dismissal ownership while an overlay is open.
 *
 * Call when the overlay becomes visible; call the returned function when it
 * closes. Escape reaches only the most recently registered overlay.
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
