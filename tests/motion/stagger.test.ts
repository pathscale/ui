import { describe, expect, it } from "bun:test";
import { stagger } from "../../src/motion/stagger";

describe("stagger", () => {
  it("returns an index-based delay in milliseconds", () => {
    expect(stagger(0)).toBe(0);
    expect(stagger(3)).toBe(150);
    expect(stagger(3, 20)).toBe(60);
  });

  it("keeps negative and non-finite inputs from creating invalid delays", () => {
    expect(stagger(-2, 50)).toBe(0);
    expect(stagger(2, -10)).toBe(0);
    expect(stagger(Number.NaN, 20)).toBe(0);
    expect(stagger(3, Number.POSITIVE_INFINITY)).toBe(0);
  });
});
