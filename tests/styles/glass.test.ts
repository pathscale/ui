import { describe, expect, it } from "bun:test";
import {
  GLASS_DEFAULTS,
  GLASS_LIMITS,
  applyGlassTokens,
  glassTokensToCss,
  resolveGlassTokens,
} from "../../src/styles/glass";

/**
 * The point of the three-knob interface is that a theme can adopt glass without
 * knowing the token vocabulary, so what these assert is that no input produces
 * a token set a browser would reject. A malformed value here does not throw or
 * look wrong: CSS drops the declaration and the surface silently loses its
 * background, which is the failure this whole module exists to remove.
 */

const MODES = ["light", "dark"] as const;

/** Every token the component CSS reads and this module is responsible for. */
const DERIVED = Object.keys(resolveGlassTokens(GLASS_DEFAULTS.dark, "dark"));

describe("glass tuning", () => {
  it("derives the same token set whatever the input", () => {
    for (const mode of MODES) {
      for (const tuning of [
        GLASS_DEFAULTS[mode],
        { blur: 0, refraction: 0, depth: 0 },
        { blur: 999, refraction: 999, depth: 999 },
        {},
      ]) {
        expect(Object.keys(resolveGlassTokens(tuning, mode)).sort()).toEqual([...DERIVED].sort());
      }
    }
  });

  it("emits values CSS can parse", () => {
    const shape = /^(-?\d+(\.\d+)?(px|%)?|0 .*|1(\.\d+)?)$/;
    for (const mode of MODES) {
      for (const [name, value] of Object.entries(resolveGlassTokens(GLASS_DEFAULTS[mode], mode))) {
        expect(value, `${name} is empty`).not.toBe("");
        expect(value, `${name} = ${value}`).not.toContain("NaN");
        expect(value, `${name} = ${value}`).not.toContain("undefined");
        expect(value, `${name} = ${value}`).toMatch(shape);
      }
    }
  });

  /**
   * The knobs are clamped rather than validated, because a settings panel binds
   * a slider straight to them and a number out of range should read as the end
   * of the range, not as a broken surface.
   */
  it("clamps out-of-range input instead of propagating it", () => {
    for (const mode of MODES) {
      const high = resolveGlassTokens({ blur: 1e6, refraction: 1e6, depth: 1e6 }, mode);
      const max = resolveGlassTokens(
        {
          blur: GLASS_LIMITS.blur.max,
          refraction: GLASS_LIMITS.refraction.max,
          depth: GLASS_LIMITS.depth.max,
        },
        mode,
      );
      expect(high).toEqual(max);

      const low = resolveGlassTokens({ blur: -50, refraction: -1, depth: -1 }, mode);
      const min = resolveGlassTokens({ blur: 0, refraction: 0, depth: 0 }, mode);
      expect(low).toEqual(min);
    }
  });

  it("falls back to the mode's defaults for anything missing or not a number", () => {
    for (const mode of MODES) {
      const expected = resolveGlassTokens(GLASS_DEFAULTS[mode], mode);
      expect(resolveGlassTokens({}, mode)).toEqual(expected);
      expect(
        resolveGlassTokens({ blur: Number.NaN, refraction: undefined, depth: Number.NaN }, mode),
      ).toEqual(expected);
    }
  });

  /**
   * Zero refraction is the "no glass" end of the slider, and it has to reach
   * actual zero rather than a small number: a 0.4% tint is not invisible, it is
   * a surface that looks subtly dirty and cannot be turned off.
   */
  it("reaches a true zero at the bottom of the range", () => {
    for (const mode of MODES) {
      const off = resolveGlassTokens({ blur: 0, refraction: 0, depth: 0 }, mode);
      expect(off["--glass-background-opacity"]).toBe("0%");
      expect(off["--glass-border-opacity"]).toBe("0%");
      expect(off["--glass-highlight-opacity"]).toBe("0%");
      expect(off["--glass-blur"]).toBe("0px");
      expect(off["--glass-shadow-depth"]).toBe("0 0 0 rgb(0 0 0 / 0%)");
    }
  });

  it("moves monotonically with each knob", () => {
    for (const mode of MODES) {
      const at = (refraction: number) =>
        Number.parseFloat(
          resolveGlassTokens({ ...GLASS_DEFAULTS[mode], refraction }, mode)[
            "--glass-border-opacity"
          ] as string,
        );
      expect(at(0)).toBeLessThan(at(0.2));
      expect(at(0.2)).toBeLessThan(at(0.4));

      const depthAt = (depth: number) =>
        Number.parseFloat(
          resolveGlassTokens({ ...GLASS_DEFAULTS[mode], depth }, mode)[
            "--glass-depth-sheen-opacity"
          ] as string,
        );
      expect(depthAt(0)).toBeLessThan(depthAt(15));
      expect(depthAt(15)).toBeLessThan(depthAt(30));
    }
  });

  it("writes every derived token onto the target element", () => {
    const written: Record<string, string> = {};
    applyGlassTokens(GLASS_DEFAULTS.dark, "dark", {
      style: { setProperty: (name, value) => { written[name] = value; } },
    });
    expect(Object.keys(written).sort()).toEqual([...DERIVED].sort());
  });

  it("renders a declaration block a theme file can hold", () => {
    const css = glassTokensToCss(GLASS_DEFAULTS.light, "light");
    const lines = css.split("\n");
    expect(lines).toHaveLength(DERIVED.length);
    for (const line of lines) expect(line).toMatch(/^ {2}--glass-[a-z-]+: .+;$/);
  });
});
