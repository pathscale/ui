import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  GLASS_DEFAULTS,
  GLASS_LIMITS,
  resolveGlassTokens,
} from "../../src/styles/glass";

/**
 * A `--glass-*` fallback has to be a value the theme could have produced.
 *
 * Every read of a glass token in component CSS carries a fallback, because an
 * undefined custom property does not fall back to its initial value: CSS drops
 * the whole declaration, so a bare read would give a surface with no background
 * at all. That makes the fallback the value a theme gets when it defines most
 * of the vocabulary and misses one, which is the common case rather than an
 * exotic one.
 *
 * `--glass-blur` had `50px` against a derived default of `9px`. A theme missing
 * that one token jumped to five and a half times the intended blur, which is
 * both wrong to look at and expensive: backdrop passes were measured at 152 MB
 * of textures in the consuming app, and blur radius is what decides how far a
 * pass has to reach.
 *
 * The opacities deliberately differ per component - a card is not a dock - so
 * this asserts the range rather than equality. Blur is the one where a value
 * outside the tuning range cannot be a design choice.
 */

const SRC = join(import.meta.dir, "..", "..", "src");

function cssFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...cssFiles(path));
    else if (entry.endsWith(".css")) out.push(path);
  }
  return out;
}

/** Every `var(--glass-blur, N px)` fallback, with where it came from. */
function blurFallbacks(): { file: string; line: number; px: number }[] {
  const found: { file: string; line: number; px: number }[] = [];
  for (const file of cssFiles(SRC)) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((text, index) => {
      for (const match of text.matchAll(/var\(--glass-blur,\s*([\d.]+)px\)/g)) {
        found.push({
          file: file.slice(SRC.length + 1),
          line: index + 1,
          px: Number.parseFloat(match[1]),
        });
      }
    });
  }
  return found;
}

describe("glass fallbacks stay inside the tuning range", () => {
  it("finds the blur fallbacks it is meant to be checking", () => {
    // A regex that silently matches nothing would make every assertion below
    // vacuously true, which is the failure mode this whole file exists to stop.
    expect(blurFallbacks().length).toBeGreaterThan(0);
  });

  it("never falls back to a blur the tuning range cannot produce", () => {
    for (const { file, line, px } of blurFallbacks()) {
      expect(px, `${file}:${line} falls back to ${px}px`).toBeLessThanOrEqual(
        GLASS_LIMITS.blur.max,
      );
      expect(
        px,
        `${file}:${line} falls back to ${px}px`,
      ).toBeGreaterThanOrEqual(GLASS_LIMITS.blur.min);
    }
  });

  it("keeps every blur fallback near what the shipped themes derive", () => {
    const derived = Number.parseFloat(
      resolveGlassTokens(GLASS_DEFAULTS.dark, "dark")["--glass-blur"],
    );

    for (const { file, line, px } of blurFallbacks()) {
      // Room for a component that wants a heavier or lighter pane, but not for
      // the 5.5x that `50px` against a 9px default represented.
      expect(
        px,
        `${file}:${line} falls back to ${px}px against a derived ${derived}px`,
      ).toBeLessThan(derived * 2);
    }
  });
});
