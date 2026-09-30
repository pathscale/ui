import { describe, expect, it } from "bun:test";
import { springKeyframes } from "../../src/motion/spring-keyframes";

describe("springKeyframes", () => {
  it("samples a finite response at 60 Hz and settles at unit endpoints", () => {
    const values = springKeyframes({ stiffness: 200, damping: 24, mass: 1 });

    expect(values.length).toBeGreaterThan(2);
    expect(values[0]).toBe(0);
    expect(values[values.length - 1]).toBe(1);
    expect(values.every(Number.isFinite)).toBe(true);
    expect(values.length).toBeLessThanOrEqual(302);
  });

  it("returns an immediate unit transition for invalid spring parameters", () => {
    expect(springKeyframes({ stiffness: 0, damping: 12, mass: 1 })).toEqual([
      0, 1,
    ]);
    expect(springKeyframes({ stiffness: 100, damping: -1, mass: 1 })).toEqual([
      0, 1,
    ]);
  });

  it("preserves overshoot for an underdamped spring", () => {
    const values = springKeyframes({ stiffness: 200, damping: 8, mass: 1 });

    expect(values.some((value) => value > 1)).toBe(true);
    expect(values[values.length - 1]).toBe(1);
  });
});
