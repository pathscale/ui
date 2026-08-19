import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { GLASS_DEFAULTS, resolveGlassTokens } from "../../src/styles/glass";

/**
 * Glass reaches surfaces, and controls decide separately.
 *
 * Two failures motivate this file, and both were invisible to a
 * per-declaration test.
 *
 * The first: a control that takes `--color-base-100` raw paints white in a
 * light palette, so every switch, radio, select trigger and language button
 * landed as a bright slab on a dark glass panel. Five separate screenshots of
 * "some elements are not getting glass" were all this one rule.
 *
 * The second is the reason it is a *separate* token rather than the surface
 * one. Alpha stacks multiplicatively, so a control sharing the surface film
 * reads as disabled and its label stops being legible. The default therefore
 * has to be fully opaque: turning glass on must not be able to make anything
 * unreadable.
 *
 * These assert the property rather than the spelling, which is the lesson from
 * a test in the consuming app that required a `color-mix(... transparent ...)`
 * *literally* - the exact form that loses its alpha to Lightning CSS - and so
 * stayed green while every panel shipped solid.
 */

const MATERIAL_CSS = readFileSync(
  join(
    import.meta.dir,
    "..",
    "..",
    "src",
    "components",
    "_shared",
    "material.css",
  ),
  "utf8",
);

const opacity = (tokens: Record<string, string>, name: string) =>
  Number.parseFloat(tokens[name]);

describe("the control axis defaults to opaque", () => {
  it("leaves controls fully opaque at the default tuning", () => {
    for (const mode of ["light", "dark"] as const) {
      const tokens = resolveGlassTokens(GLASS_DEFAULTS[mode], mode);
      expect(opacity(tokens, "--glass-control-opacity")).toBe(100);
    }
  });

  it("keeps the surface translucent while the control is not", () => {
    const tokens = resolveGlassTokens(GLASS_DEFAULTS.dark, "dark");
    const surface = opacity(tokens, "--glass-background-opacity");

    // The surface has to actually be glass, or this proves nothing about the
    // two being independent.
    expect(surface).toBeGreaterThan(0);
    expect(surface).toBeLessThan(100);
    expect(opacity(tokens, "--glass-control-opacity")).toBe(100);
  });

  it("lets an app tint its chrome without touching a call site", () => {
    const tinted = resolveGlassTokens(
      { ...GLASS_DEFAULTS.dark, controlTint: 1 },
      "dark",
    );
    // At full tint the control matches the surface film exactly.
    expect(opacity(tinted, "--glass-control-opacity")).toBeCloseTo(
      opacity(tinted, "--glass-background-opacity"),
      5,
    );
  });

  it("moves monotonically between opaque and the surface film", () => {
    const at = (controlTint: number) =>
      opacity(
        resolveGlassTokens({ ...GLASS_DEFAULTS.dark, controlTint }, "dark"),
        "--glass-control-opacity",
      );

    expect(at(0)).toBeGreaterThan(at(0.5));
    expect(at(0.5)).toBeGreaterThan(at(1));
  });

  it("clamps a tint outside the range rather than emitting nonsense", () => {
    const at = (controlTint: number) =>
      opacity(
        resolveGlassTokens({ ...GLASS_DEFAULTS.dark, controlTint }, "dark"),
        "--glass-control-opacity",
      );

    expect(at(9)).toBe(at(1));
    expect(at(-3)).toBe(at(0));
  });
});

describe("glass is one flip", () => {
  /*
   * The whole point of the exercise: an app sets glass in one place and every
   * component follows. If this rule ever regains a per-component precondition,
   * glass goes back to being twelve hand edits.
   */
  it("turns unset components to glass from the root class alone", () => {
    expect(MATERIAL_CSS).toContain(
      ':root.glass [data-material="solid"]:not([data-material-explicit])',
    );
  });

  /*
   * `@container style()` is the expression this wants. Blitz does not
   * implement it - shown by rendering, in that engine's own
   * `container_style_query.rs` - so the block would have been dead CSS and the
   * flip would have looked broken rather than unsupported.
   */
  it("does not depend on a style container query", () => {
    expect(MATERIAL_CSS).not.toContain("@container style(");
  });

  /*
   * An explicit `material="solid"` inside a glassed app has to keep winning,
   * or the flip becomes a thing you cannot locally escape.
   */
  it("still lets a component be told to stay solid", () => {
    expect(MATERIAL_CSS).toContain(
      '[data-material="solid"][data-material-explicit]',
    );
  });
});

describe("glass inside glass does not stack a second film", () => {
  /*
   * Two surfaces at 55% composite to 1 - 0.45^2 = 79.75%, which reads as a
   * flat slab. Dropping only the backdrop filter, as this did, leaves the
   * fills stacking.
   */
  it("clears the inner fill and not just the inner filter", () => {
    const nested = MATERIAL_CSS.slice(
      MATERIAL_CSS.indexOf('[data-material="glass"] [data-material="glass"] {'),
    ).slice(0, 260);

    expect(nested).toContain("background-color: transparent");
    expect(nested).toContain("backdrop-filter: none");
  });
});
