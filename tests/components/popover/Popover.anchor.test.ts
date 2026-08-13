import { describe, expect, it } from "bun:test";
import {
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
});
