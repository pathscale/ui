import { describe, expect, it } from "bun:test";

const layout = await Bun.file(
  new URL("../src/components/color-wheel-flower/ColorWheelFlower.layout.tsx", import.meta.url),
).text();

describe("ColorWheelFlower first paint", () => {
  it("writes final petal state before enabling interaction motion", () => {
    expect(layout).toMatch(
      /if \(!hasPaintedFinalState\) \{\s*applyMotionState\(motionRef, target\);\s*hasPaintedFinalState = true;\s*return;\s*\}\s*const transition = dotTransition\(\);/s,
    );
  });

  it("does not pay for computed-style reads on initial mount", () => {
    const firstPaint = layout.indexOf("if (!hasPaintedFinalState)");
    const animatedRead = layout.indexOf("readMotionState(motionRef)", firstPaint);
    const earlyReturn = layout.indexOf("return;", firstPaint);

    expect(firstPaint).toBeGreaterThan(-1);
    expect(animatedRead).toBeGreaterThan(earlyReturn);
  });
});
