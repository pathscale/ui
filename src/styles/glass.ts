/**
 * Glass, as three numbers instead of thirty-one.
 *
 * `material="glass"` is styled by a family of `--glass-*` custom properties.
 * Both shipped themes declare all of them by hand, which made glass a thing you
 * inherited rather than a thing you could add: a new theme had to copy
 * thirty-one values, and three of them are read without a fallback, so a theme
 * that copied twenty-eight got a card with no background at all rather than a
 * plainer one. An undefined custom property does not fall back to its initial
 * value; CSS drops the whole declaration.
 *
 * So the set splits in two. Six are colours and stay with the theme, because
 * only the theme knows what its glass is tinted with. The other twenty-five are
 * opacities, sizes and blurs, and every one of them is a function of three
 * numbers:
 *
 *   blur        how far the backdrop is smeared, in pixels
 *   refraction  how much the surface asserts itself: tint, border, highlights
 *   depth       how far off the page it sits: glows, sheen, shadow
 *
 * Adding glass to a theme is now those three numbers and, if it wants them, the
 * six colours. The curves are lifted from the tuning surface that consulting.parcle.ai
 * arrived at by eye against this same token vocabulary, so the shipped themes
 * keep the appearance they already had.
 */

export type GlassMode = "light" | "dark";

/** What a theme sets. Everything else is derived. */
export type GlassTuning = {
  /** Backdrop blur radius in pixels. 0 turns glass into a plain translucent fill. */
  blur: number;
  /**
   * How much the surface asserts itself, 0 to 0.4.
   *
   * Drives tint, border, highlights and rim together, because they are one
   * physical property and tuning them separately is how the thirty-one-value
   * version became unmaintainable.
   */
  refraction: number;
  /** How far off the page it sits, 0 to 30. Drives glows, sheen and shadow. */
  depth: number;
};

export const GLASS_LIMITS = {
  blur: { min: 0, max: 50 },
  refraction: { min: 0, max: 0.4 },
  depth: { min: 0, max: 30 },
} as const;

/** What the shipped themes use. Both land on the same numbers. */
export const GLASS_DEFAULTS: Record<GlassMode, GlassTuning> = {
  light: { blur: 9, refraction: 0.31, depth: 24 },
  dark: { blur: 9, refraction: 0.31, depth: 24 },
};

const clamp = (value: unknown, min: number, max: number, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

const round = (v: number, places = 2) =>
  String(Math.round((v + Number.EPSILON) * 10 ** places) / 10 ** places);
const pct = (v: number, places = 2) => `${round(v, places)}%`;
const px = (v: number, places = 2) => `${round(v, places)}px`;

/**
 * The three knobs, clamped and normalised to 0..1.
 *
 * The fractional powers are why this is TypeScript and not `calc()`: CSS has no
 * exponent, and the curves are not linear. A linear ramp reads as a lighting
 * change rather than a material one - the highlights arrive too early and the
 * tint too late.
 */
function normalise(tuning: Partial<GlassTuning>, mode: GlassMode) {
  const base = GLASS_DEFAULTS[mode];
  const blur = clamp(tuning.blur, GLASS_LIMITS.blur.min, GLASS_LIMITS.blur.max, base.blur);
  const refraction = clamp(
    tuning.refraction,
    GLASS_LIMITS.refraction.min,
    GLASS_LIMITS.refraction.max,
    base.refraction,
  );
  const depth = clamp(tuning.depth, GLASS_LIMITS.depth.min, GLASS_LIMITS.depth.max, base.depth);

  const r = refraction / GLASS_LIMITS.refraction.max;
  const d = depth / GLASS_LIMITS.depth.max;
  return {
    blur,
    light: mode === "light",
    /** Surface response: how strongly edges and highlights read. */
    rs: r === 0 ? 0 : r ** 0.82,
    /** Volume response: how strongly the body tints. */
    rv: r === 0 ? 0 : r ** 0.95,
    /** Depth response. */
    ds: d === 0 ? 0 : d ** 0.85,
    r,
    d,
  };
}

/**
 * The `--glass-*` custom properties three numbers imply.
 *
 * Returns only what is derived. The six colours - background, border,
 * highlight, the two rim stops and the inner glow - are the theme's, and a
 * theme that sets none of them still renders because the component CSS carries
 * fallbacks for all six.
 */
export function resolveGlassTokens(
  tuning: Partial<GlassTuning>,
  mode: GlassMode,
): Record<string, string> {
  const v = normalise(tuning, mode);
  const { rs, rv, ds, light } = v;
  const zero = v.r === 0;

  const background = light ? (zero ? 0 : 18 + 30 * rv) : 7 * rv;
  const border = light ? (zero ? 0 : 18 + 18 * rs) : 26 * rs;
  const highlight = light ? (zero ? 0 : 22 + 26 * rs) : 24 * rs;
  const bottomHighlight = light
    ? zero
      ? 0
      : 10 + 14 * rs + 5 * ds
    : 3.5 * rs + 3 * rs * ds;
  const edgeHighlight = light ? (zero ? 0 : 20 + 22 * rs + 4 * ds) : 18 * rs + 4 * ds;
  const rimStart = light ? (zero ? 0 : 14 + 18 * rs + 4 * ds) : 17 * rs + 3 * ds;
  const rimEnd = light ? (zero ? 0 : 18 + 22 * rs + 4 * ds) : 23 * rs + 5 * ds;
  const innerGlow = light
    ? 0.035 * rs + 0.045 * rs * ds + 0.012 * ds
    : 0.055 * rs * ds + 0.018 * ds;
  const topGlow = light ? 8 * ds * (0.4 + 0.6 * rs) : 6 * ds * (0.35 + 0.65 * rs);
  const bottomGlow = light ? 9 * ds * (0.25 + 0.65 * rs) : 5 * ds * (0.2 + 0.55 * rs);
  const sheen = light ? 14 * ds * (0.25 + 0.75 * rs) : 10 * ds * (0.25 + 0.75 * rs);

  /*
   * What a browser without `backdrop-filter` falls back to. It has to be far
   * more opaque than the blurred version, because without the blur the text
   * behind it shows through as noise rather than as depth.
   */
  const fallbackBackground = Math.min(70, light ? background + 10 * rs : background * 8 + 12 * rs);

  const shadow =
    ds > 0
      ? `0 ${px(light ? 5 + 10 * ds : 4 + 10 * ds)} ${px(light ? 20 + 28 * ds : 18 + 26 * ds)} rgb(0 0 0 / ${pct(light ? 2 + 5 * ds : 3 + 7 * ds)})`
      : "0 0 0 rgb(0 0 0 / 0%)";

  return {
    "--glass-blur": px(v.blur, 0),
    "--glass-saturation": round(1 + 0.18 * rs),
    "--glass-brightness": "1",
    "--glass-background-opacity": pct(background),
    "--glass-border-opacity": pct(border),
    "--glass-highlight-opacity": pct(highlight),
    "--glass-bottom-highlight-opacity": pct(bottomHighlight),
    "--glass-edge-highlight-opacity": pct(edgeHighlight),
    "--glass-rim-start-opacity": pct(rimStart),
    "--glass-rim-end-opacity": pct(rimEnd),
    "--glass-inner-glow-alpha": round(innerGlow, 3),
    "--glass-inner-glow-blur": px(ds > 0 ? 1 + 3 * ds : 0),
    "--glass-inner-glow-spread": "0px",
    "--glass-depth-top-glow-opacity": pct(topGlow),
    "--glass-depth-bottom-glow-opacity": pct(bottomGlow),
    "--glass-depth-sheen-opacity": pct(sheen),
    "--glass-depth-sheen-size": pct(82 - 16 * ds),
    "--glass-depth-surface-opacity": "0%",
    "--glass-depth-surface-size": pct(82),
    "--glass-glow-ring-opacity": pct(light ? 6 * rs : 10 * rs),
    "--glass-liquid-edge-size": px(1 + 2 * rs),
    "--glass-liquid-inner-blur": px(6 + 12 * rs),
    "--glass-shadow-depth": shadow,
    "--glass-fallback-background-opacity": pct(fallbackBackground),
  };
}

/**
 * Writes the derived tokens onto an element, `:root` by default.
 *
 * Inline styles rather than a stylesheet, because this is the layer above the
 * theme: a theme sets its glass in CSS, and this is for changing it at runtime
 * without a rebuild - a settings panel, a per-route override, a preview.
 *
 * A no-op without a DOM, so it is safe to call during server rendering.
 */
export function applyGlassTokens(
  tuning: Partial<GlassTuning>,
  mode: GlassMode,
  target?: { style: { setProperty(name: string, value: string): void } },
): void {
  const element =
    target ?? (typeof document === "undefined" ? undefined : document.documentElement);
  if (!element) return;
  for (const [name, value] of Object.entries(resolveGlassTokens(tuning, mode))) {
    element.style.setProperty(name, value);
  }
}

/**
 * The derived tokens as a CSS declaration block, for a theme that wants them
 * baked in rather than applied at runtime.
 *
 * The intended use is a build step or a scratch buffer: paste the output into a
 * theme file beside its six colours and glass is part of that theme, with no
 * JavaScript involved.
 */
export function glassTokensToCss(tuning: Partial<GlassTuning>, mode: GlassMode): string {
  return Object.entries(resolveGlassTokens(tuning, mode))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");
}
