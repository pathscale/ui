import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { GLASS_DEFAULTS, GLASS_LIMITS, resolveGlassTokens } from "../../src/styles/glass";

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

describe("the defaults are fully resolved", () => {
  /*
   * A settings panel drives one slider per axis, so it indexes the defaults by
   * a computed key: `GLASS_DEFAULTS[mode][axis]`. Typed as a plain GlassTuning
   * that reads back as `number | undefined` the moment any axis is optional,
   * and every such call site fails to compile on a value this object never
   * actually contains. `Required<GlassTuning>` is what keeps it a number.
   */
  it("gives every axis a number in both modes", () => {
    for (const mode of ["light", "dark"] as const) {
      for (const axis of [
        "blur",
        "refraction",
        "depth",
        "controlTint",
      ] as const) {
        const value: number = GLASS_DEFAULTS[mode][axis];
        expect(Number.isFinite(value)).toBe(true);
      }
    }
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

describe("the flip does not buy a backdrop pass per component", () => {
  /*
   * A `backdrop-filter` is not a paint property: it cuts the frame. The
   * renderer stops, rasterises what has been drawn, copies it to an atlas,
   * blurs it and draws the full-frame result back - per boundary, per frame.
   *
   * Applied to every component that never set `material`, that is a full-frame
   * pass each. Measured in the consuming app when it was: 3156 of 3157
   * main-thread samples inside `wgpu_hal::metal::Device::wait` under
   * `anyrender_vello::backdrop::execute`, and `renderer_avg_ms=13.24` against
   * an 8.3 ms budget at 120 Hz. The window beachballed.
   *
   * An explicit `material="glass"` keeps the filter, because that is a choice
   * about one surface. The default cannot be.
   */
  it("tints flipped components without filtering behind them", () => {
    const flip = MATERIAL_CSS.slice(
      MATERIAL_CSS.indexOf(
        ':root.glass [data-material="solid"]:not([data-material-explicit]) {',
      ),
    );
    const rule = flip.slice(0, flip.indexOf("}") + 1);

    expect(rule).toContain("background-color");
    expect(rule).not.toContain("backdrop-filter");
  });

  it("still gives an explicitly glassed component its filter", () => {
    const explicit = MATERIAL_CSS.slice(
      MATERIAL_CSS.indexOf('[data-material="glass"] {'),
    );
    expect(explicit.slice(0, explicit.indexOf("}") + 1)).toContain(
      "backdrop-filter",
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

describe("the dark curves move enough to see", () => {
  /*
   * Both axes were reported as broken, and neither was: they were producing
   * changes below what anyone can perceive on a near-black desk.
   *
   * Measured before this: refraction moved the film across its *entire* range
   * from 0% to 7%, against light mode's 18% to 48%, and depth's largest sheen
   * was 8.59% with a shadow of 10% black over a desk at 10% lightness. A slider
   * whose full travel is invisible reads as a dead control, and the consuming
   * app worked around the first by overriding the token from a slider of its
   * own.
   *
   * Asserted as a span rather than as specific values, so the curves stay
   * tunable and only the property that made them useless is pinned.
   */
  const at = (axis: "refraction" | "depth", value: number, token: string) =>
    Number.parseFloat(
      resolveGlassTokens(
        { ...GLASS_DEFAULTS.dark, [axis]: value },
        "dark",
      )[token],
    );

  it("gives refraction a film worth looking at", () => {
    const top = at("refraction", GLASS_LIMITS.refraction.max, "--glass-background-opacity");
    expect(top).toBeGreaterThanOrEqual(20);
  });

  it("moves refraction monotonically across its range", () => {
    const low = at("refraction", 0.1, "--glass-background-opacity");
    const high = at("refraction", 0.4, "--glass-background-opacity");
    expect(high).toBeGreaterThan(low);
    // The step across the useful middle has to be visible on its own.
    expect(high - low).toBeGreaterThan(8);
  });

  it("gives depth a sheen and a shadow that register on a dark desk", () => {
    expect(at("depth", GLASS_LIMITS.depth.max, "--glass-depth-sheen-opacity")).toBeGreaterThan(12);
    const shadow = resolveGlassTokens(
      { ...GLASS_DEFAULTS.dark, depth: GLASS_LIMITS.depth.max },
      "dark",
    )["--glass-shadow-depth"];
    const alpha = Number.parseFloat(shadow.match(/\/\s*([\d.]+)%/)?.[1] ?? "0");
    expect(alpha).toBeGreaterThan(20);
  });

  it("still resolves every axis to zero at zero", () => {
    expect(at("refraction", 0, "--glass-background-opacity")).toBe(0);
    expect(at("depth", 0, "--glass-depth-sheen-opacity")).toBe(0);
  });
});
