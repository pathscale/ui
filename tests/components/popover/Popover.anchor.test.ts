import { afterEach, describe, expect, it, mock } from "bun:test";
import { createRoot, createSignal } from "solid-js";
import {
  createOverlayPosition,
  type OverlayAnchorRect,
  resolveOverlayAnchorRect,
} from "../../../src/components/_shared/overlayPosition";

const virtualRect: OverlayAnchorRect = {
  top: 10,
  left: 20,
  width: 30,
  height: 40,
  right: 50,
  bottom: 50,
};

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

describe("Popover virtual anchoring", () => {
  it("positions from an anchor rectangle without a trigger element", () => {
    expect(resolveOverlayAnchorRect(undefined, virtualRect)).toBe(virtualRect);
  });

  it("prefers an anchor rectangle over a trigger element", () => {
    const triggerRect = { ...virtualRect, left: 100, right: 130 };
    const trigger = {
      getBoundingClientRect: () => triggerRect as DOMRect,
    };

    expect(resolveOverlayAnchorRect(trigger, virtualRect)).toBe(virtualRect);
    expect(resolveOverlayAnchorRect(trigger, undefined)).toBe(triggerRect);
  });

  it("never overrides the component visibility contract", async () => {
    const requestFrame = mock(() => 1);
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        innerWidth: 800,
        innerHeight: 600,
        addEventListener: mock(() => {}),
        removeEventListener: mock(() => {}),
      },
    });
    Object.defineProperty(globalThis, "requestAnimationFrame", {
      configurable: true,
      value: requestFrame,
    });
    Object.defineProperty(globalThis, "cancelAnimationFrame", {
      configurable: true,
      value: mock(() => {}),
    });

    await createRoot(async (dispose) => {
      const [open, setOpen] = createSignal(false);
      const position = createOverlayPosition({
        open,
        triggerRef: () => undefined,
        anchorRect: () => virtualRect,
        overlayRef: () =>
          ({
            getBoundingClientRect: () => ({
              top: 0,
              left: 0,
              width: 160,
              height: 120,
              right: 160,
              bottom: 120,
            }),
          }) as HTMLElement,
        placement: () => "bottom",
        offset: () => 6,
      });

      expect(position.style()).toEqual({});
      setOpen(true);
      await Promise.resolve();
      expect(position.style()).toMatchObject({
        position: "fixed",
        top: "56px",
        left: "8px",
      });
      expect(position.style()).not.toHaveProperty("visibility");
      expect(requestFrame).not.toHaveBeenCalled();
      dispose();
    });
  });

  it("stays visibility-safe while a portal ref settles after opening", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        innerWidth: 800,
        innerHeight: 600,
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

    await createRoot(async (dispose) => {
      const [open, setOpen] = createSignal(false);
      const [overlay, setOverlay] = createSignal<HTMLElement>();
      const position = createOverlayPosition({
        open,
        triggerRef: () => undefined,
        anchorRect: () => virtualRect,
        overlayRef: overlay,
        placement: () => "bottom",
        offset: () => 6,
      });

      setOpen(true);
      await Promise.resolve();
      expect(position.style()).toEqual({});

      setOverlay({
        getBoundingClientRect: () => ({
          top: 0,
          left: 0,
          width: 160,
          height: 120,
          right: 160,
          bottom: 120,
        }),
      } as HTMLElement);
      await Promise.resolve();

      expect(position.style()).toMatchObject({
        position: "fixed",
        top: "56px",
        left: "8px",
      });
      expect(position.style()).not.toHaveProperty("visibility");
      dispose();
    });
  });
});
