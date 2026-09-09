import { afterEach, describe, expect, it, mock } from "bun:test";
import { createRoot, createSignal } from "solid-js";
import { createOverlayPosition } from "../../../src/components/_shared/overlayPosition";

/**
 * The reported "aligned dropdown opens 2365px above its trigger", reproduced.
 *
 * A sweep of the showcase reported a `Dropdown` whose trigger sat at y=3195
 * opening its menu at y=830, while the default dropdown a screen higher was
 * correct at trigger y=538, menu y=580. The shape of that -- one instance
 * right, one wildly wrong, both the same component -- reads like an alignment
 * bug, and it is not one. This file is here so nobody spends a session on the
 * `align` code.
 *
 * Both numbers fall straight out of the positioning that ships, given where
 * the two triggers are:
 *
 *   default:  top = triggerBottom + offset = 538 + 36 + 6 = 580.  Reported 580.
 *   aligned:  top = 3195 + 36 + 6 = 3237, clamped to
 *             viewportHeight - overlayHeight - padding = 900 - 62 - 8 = 830.
 *             Reported 830.
 *
 * The overlay is `position: fixed`, so its coordinates are viewport
 * coordinates, and the clamp keeps a menu on screen -- the `shift` behaviour
 * every floating-ui-shaped library has. The trigger at y=3195 is a document
 * coordinate on an unscrolled page: it is roughly 2300px *below* the viewport.
 * Pressing it without scrolling to it opens a menu that is on screen while its
 * trigger is not, and the difference between the two y values is the scroll
 * position that was never applied, not a misplacement.
 *
 * A reader cannot reach that state: scrolling to the trigger is how a person
 * presses it, and then the clamp does not fire. A harness that dispatches at a
 * document coordinate can, and did.
 *
 * What would be a real bug, and is asserted below, is the clamp firing while
 * the trigger *is* on screen.
 */

const originalWindow = globalThis.window;
const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

afterEach(() => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: originalWindow,
  });
  Object.defineProperty(globalThis, "requestAnimationFrame", {
    configurable: true,
    value: originalRequestAnimationFrame,
  });
  Object.defineProperty(globalThis, "cancelAnimationFrame", {
    configurable: true,
    value: originalCancelAnimationFrame,
  });
});

const VIEWPORT_HEIGHT = 900;
const TRIGGER_HEIGHT = 36;
const MENU_HEIGHT = 62;
/** `Dropdown.Menu`'s own default. */
const SIDE_OFFSET = 6;

const stubWindow = () => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      innerWidth: 1280,
      innerHeight: VIEWPORT_HEIGHT,
      addEventListener: mock(() => {}),
      removeEventListener: mock(() => {}),
    },
  });
  Object.defineProperty(globalThis, "requestAnimationFrame", {
    configurable: true,
    value: mock(() => 1),
  });
  Object.defineProperty(globalThis, "cancelAnimationFrame", {
    configurable: true,
    value: mock(() => {}),
  });
};

const rect = (top: number, height: number, left = 100, width = 160) => ({
  top,
  left,
  width,
  height,
  right: left + width,
  bottom: top + height,
});

const openAt = async (triggerTop: number, align: "start" | "end") => {
  stubWindow();
  return createRoot(async (dispose) => {
    const [open, setOpen] = createSignal(false);
    const position = createOverlayPosition({
      open,
      triggerRef: () =>
        ({
          getBoundingClientRect: () => rect(triggerTop, TRIGGER_HEIGHT),
        }) as HTMLElement,
      overlayRef: () =>
        ({
          getBoundingClientRect: () => rect(0, MENU_HEIGHT),
        }) as HTMLElement,
      placement: () => "bottom",
      offset: () => SIDE_OFFSET,
      // `autoFlip` cannot rescue this: there is no room above either, because
      // the whole trigger is below the fold.
      autoFlip: () => true,
      align: () => align,
    });

    setOpen(true);
    await Promise.resolve();
    const top = Number.parseFloat(String(position.style().top));
    dispose();
    return top;
  });
};

describe("a dropdown opened at a trigger that is on screen", () => {
  it("sits directly under it", async () => {
    expect(await openAt(538, "start")).toBe(538 + TRIGGER_HEIGHT + SIDE_OFFSET);
  });

  it("does the same when aligned to the end", async () => {
    expect(await openAt(538, "end")).toBe(538 + TRIGGER_HEIGHT + SIDE_OFFSET);
  });

  /*
   * The one that would be a real defect: a trigger near, but not past, the
   * bottom edge still gets its menu under it while the menu fits.
   */
  it("still sits under a trigger low in the viewport", async () => {
    const lastFitting =
      VIEWPORT_HEIGHT - 8 - MENU_HEIGHT - SIDE_OFFSET - TRIGGER_HEIGHT;
    expect(await openAt(lastFitting, "start")).toBe(
      lastFitting + TRIGGER_HEIGHT + SIDE_OFFSET,
    );
  });
});

describe("a dropdown opened at a trigger that is off screen", () => {
  /*
   * The reported number, to the pixel. It is the clamp, and the clamp is what
   * keeps a menu reachable; a menu placed faithfully under a trigger 2300px
   * below the fold would be invisible and unusable.
   */
  it("reproduces the reported 830 from the reported 3195", async () => {
    expect(await openAt(3195, "start")).toBe(
      VIEWPORT_HEIGHT - MENU_HEIGHT - 8,
    );
    expect(await openAt(3195, "start")).toBe(830);
  });

  it("does it with either alignment, so alignment is not the cause", async () => {
    expect(await openAt(3195, "start")).toBe(await openAt(3195, "end"));
  });
});
