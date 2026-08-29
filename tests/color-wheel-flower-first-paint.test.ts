import { describe, expect, it } from "bun:test";

const layout = await Bun.file(
  new URL("../src/components/color-wheel-flower/ColorWheelFlower.layout.tsx", import.meta.url),
).text();
const css = await Bun.file(
  new URL("../src/components/color-wheel-flower/ColorWheelFlower.css", import.meta.url),
).text();

describe("ColorWheelFlower first paint", () => {
  it("authors the neutral petal state before JavaScript runs", () => {
    const rule = css.match(/\.color-wheel-flower__dot-motion\s*\{([\s\S]*?)\}/)?.[1] ?? "";

    expect(rule).toContain("opacity: 1");
    expect(rule).toContain("transform: translate(0, 0) scale(1)");
  });

  it("does not rely on a ref-timing style write for first paint", () => {
    expect(layout).not.toContain("hasPaintedFinalState");
    expect(layout).not.toContain("applyMotionState");
  });

  it("centres the fixed petal frame without a percentage transform", () => {
    const dotRule = css.match(/\.color-wheel-flower__dot\s*\{([\s\S]*?)\}/)?.[1] ?? "";
    const frameRule = css.match(/\.color-wheel-flower__dot-frame\s*\{([\s\S]*?)\}/)?.[1] ?? "";

    expect(dotRule).not.toContain("transform");
    expect(frameRule).toContain("width: 32px");
    expect(frameRule).toContain("height: 32px");
    expect(frameRule).toContain("margin-top: -16px");
    expect(frameRule).toContain("margin-left: -16px");
  });
});
