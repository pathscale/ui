import { createSignal, createEffect } from "solid-js";

// CSP detection: Test if inline styles are allowed
let cspAllowsInlineStyles: boolean | null = null;

const checkCspAllowsInlineStyles = (): boolean => {
  if (cspAllowsInlineStyles !== null) return cspAllowsInlineStyles;
  if (typeof window === "undefined") return true;

  try {
    const testEl = document.createElement("div");
    testEl.style.setProperty("--csp-test", "1");
    document.body.appendChild(testEl);
    const computed = getComputedStyle(testEl).getPropertyValue("--csp-test");
    document.body.removeChild(testEl);
    cspAllowsInlineStyles = computed === "1";
  } catch {
    cspAllowsInlineStyles = false;
  }

  if (!cspAllowsInlineStyles) {
    console.info("[hueShift] CSP blocks inline styles - hue customization disabled");
  }

  return cspAllowsInlineStyles;
};

// Saturation scaling: pastel colors (low saturation) should produce subtler themes
// Full saturation (100) = full chroma, low saturation = reduced chroma
const MIN_CHROMA_SCALE = 0.3;

// HSL to OKLCH hue conversion for perceptually accurate colors
function hslHueToOklchHue(hslHue: number): number {
  const h = ((hslHue % 360) + 360) % 360;

  const controlPoints: [number, number][] = [
    [0, 29],     // Red
    [30, 55],    // Orange
    [60, 100],   // Yellow
    [120, 145],  // Green
    [180, 195],  // Cyan
    [240, 265],  // Blue
    [300, 330],  // Magenta
    [360, 389],  // Red (wrapped)
  ];

  for (let i = 0; i < controlPoints.length - 1; i++) {
    const [h1, o1] = controlPoints[i];
    const [h2, o2] = controlPoints[i + 1];
    if (h >= h1 && h <= h2) {
      const t = (h - h1) / (h2 - h1);
      const oklchHue = o1 + t * (o2 - o1);
      return ((oklchHue % 360) + 360) % 360;
    }
  }

  return h;
}

// Primary color settings
const PRIMARY_SETTINGS = {
  light: {
    "--color-primary": { l: 45, c: 0.2 },
    "--color-primary-content": { l: 98, c: 0.02 },
  },
  dark: {
    "--color-primary": { l: 58, c: 0.233 },
    "--color-primary-content": { l: 96, c: 0.018 },
  },
} as const;

// Harmony colors offsets
const HARMONY_OFFSETS = {
  secondary: 108,
  accent: -94,
} as const;

const HARMONY_SETTINGS = {
  light: {
    "--color-secondary": { l: 68, c: 0.162 },
    "--color-secondary-content": { l: 98, c: 0.026 },
    "--color-accent": { l: 60, c: 0.118 },
    "--color-accent-content": { l: 98, c: 0.014 },
  },
  dark: {
    "--color-secondary": { l: 63, c: 0.237 },
    "--color-secondary-content": { l: 97, c: 0.013 },
    "--color-accent": { l: 70, c: 0.14 },
    "--color-accent-content": { l: 98, c: 0.014 },
  },
} as const;

// Semantic colors
const SEMANTIC_BASE_HUES = {
  success: 140,
  warning: 55,
  error: 10,
  info: 220,
} as const;

const SEMANTIC_TINT_FACTOR = 0.12;

const SEMANTIC_SETTINGS = {
  light: {
    "--color-success": { l: 72, c: 0.219 },
    "--color-success-content": { l: 98, c: 0.018 },
    "--color-warning": { l: 70, c: 0.213 },
    "--color-warning-content": { l: 98, c: 0.016 },
    "--color-error": { l: 65, c: 0.241 },
    "--color-error-content": { l: 97, c: 0.014 },
    "--color-info": { l: 68, c: 0.169 },
    "--color-info-content": { l: 97, c: 0.013 },
  },
  dark: {
    "--color-success": { l: 76, c: 0.233 },
    "--color-success-content": { l: 98, c: 0.031 },
    "--color-warning": { l: 79, c: 0.184 },
    "--color-warning-content": { l: 98, c: 0.026 },
    "--color-error": { l: 64, c: 0.246 },
    "--color-error-content": { l: 96, c: 0.015 },
    "--color-info": { l: 71, c: 0.143 },
    "--color-info-content": { l: 98, c: 0.019 },
  },
} as const;

// Base/neutral colors
const BASE_COLORS = {
  light: {
    "--color-base-100": { l: 98, c: 0.001, h: 106.423 },
    "--color-base-200": { l: 97, c: 0.001, h: 106.424 },
    "--color-base-300": { l: 92, c: 0.003, h: 48.717 },
  },
  dark: {
    "--color-base-100": { l: 13, c: 0.028, h: 261.692 },
    "--color-base-200": { l: 21, c: 0.034, h: 264.665 },
    "--color-base-300": { l: 27, c: 0.033, h: 256.848 },
  },
} as const;

const BASE_CHROMA_BOOST = 0.025;

// Gradient colors in HSL format
const GRADIENT_COLORS = {
  light: {
    "--gradient-start": { h: 347, s: 47, l: 93 },
    "--gradient-end": { h: 199, s: 45, l: 93 },
  },
  dark: {
    "--gradient-start": { h: 261, s: 38, l: 15 },
    "--gradient-end": { h: 220, s: 54, l: 8 },
  },
} as const;

function toOklch(l: number, c: number, h: number) {
  const normalizedH = ((h % 360) + 360) % 360;
  return `oklch(${l}% ${c} ${normalizedH})`;
}

function hslToHex(h: number, s: number, l: number): string {
  const normalizedH = ((h % 360) + 360) % 360;
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((normalizedH / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;

  if (normalizedH < 60) { r = c; g = x; b = 0; }
  else if (normalizedH < 120) { r = x; g = c; b = 0; }
  else if (normalizedH < 180) { r = 0; g = c; b = x; }
  else if (normalizedH < 240) { r = 0; g = x; b = c; }
  else if (normalizedH < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getTintedHue(baseHue: number, targetHue: number): number {
  let diff = targetHue - baseHue;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return baseHue + diff * SEMANTIC_TINT_FACTOR;
}

function getResolvedTheme(): "light" | "dark" {
  const dataTheme = document.documentElement.getAttribute("data-theme");
  if (dataTheme === "dark") return "dark";
  if (dataTheme === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyHueShift(targetHue: number, saturation: number = 100) {
  if (!checkCspAllowsInlineStyles()) return;

  const root = document.documentElement;
  const oklchHue = hslHueToOklchHue(targetHue);
  const chromaScale = MIN_CHROMA_SCALE + (1 - MIN_CHROMA_SCALE) * (saturation / 100);
  const resolvedTheme = getResolvedTheme();

  // Set PRIMARY colors
  const primarySettings = PRIMARY_SETTINGS[resolvedTheme];
  for (const [varName, settings] of Object.entries(primarySettings)) {
    const scaledChroma = settings.c * chromaScale;
    root.style.setProperty(varName, toOklch(settings.l, scaledChroma, oklchHue));
  }

  // Set HARMONY colors
  const harmonySettings = HARMONY_SETTINGS[resolvedTheme];
  for (const [varName, settings] of Object.entries(harmonySettings)) {
    let hue = oklchHue;
    if (varName.includes("secondary")) {
      hue = oklchHue + HARMONY_OFFSETS.secondary;
    } else if (varName.includes("accent")) {
      hue = oklchHue + HARMONY_OFFSETS.accent;
    }
    const scaledChroma = settings.c * chromaScale;
    root.style.setProperty(varName, toOklch(settings.l, scaledChroma, hue));
  }

  // Set SEMANTIC colors
  const semanticSettings = SEMANTIC_SETTINGS[resolvedTheme];
  for (const [varName, settings] of Object.entries(semanticSettings)) {
    let baseHue = 0;
    if (varName.includes("success")) baseHue = SEMANTIC_BASE_HUES.success;
    else if (varName.includes("warning")) baseHue = SEMANTIC_BASE_HUES.warning;
    else if (varName.includes("error")) baseHue = SEMANTIC_BASE_HUES.error;
    else if (varName.includes("info")) baseHue = SEMANTIC_BASE_HUES.info;

    const tintedHue = getTintedHue(baseHue, oklchHue);
    const semanticChromaScale = MIN_CHROMA_SCALE + (1 - MIN_CHROMA_SCALE) * Math.sqrt(saturation / 100);
    const scaledChroma = settings.c * semanticChromaScale;
    root.style.setProperty(varName, toOklch(settings.l, scaledChroma, tintedHue));
  }

  // Shift gradient colors
  const gradients = GRADIENT_COLORS[resolvedTheme];
  for (const [varName, color] of Object.entries(gradients)) {
    const scaledSat = color.s * (saturation / 100);
    const shifted = hslToHex(targetHue + (varName.includes("end") ? 40 : 0), scaledSat, color.l);
    root.style.setProperty(varName, shifted);
  }

  // Shift base colors
  const baseColors = BASE_COLORS[resolvedTheme];
  for (const [varName, color] of Object.entries(baseColors)) {
    const baseChroma = Math.max(color.c, BASE_CHROMA_BOOST);
    const scaledChroma = baseChroma * chromaScale;
    const shifted = toOklch(color.l, scaledChroma, oklchHue);
    root.style.setProperty(varName, shifted);
  }
}

function resetHueShift() {
  if (!checkCspAllowsInlineStyles()) return;

  const root = document.documentElement;
  for (const varName of Object.keys(PRIMARY_SETTINGS.light)) {
    root.style.removeProperty(varName);
  }
  for (const varName of Object.keys(HARMONY_SETTINGS.light)) {
    root.style.removeProperty(varName);
  }
  for (const varName of Object.keys(SEMANTIC_SETTINGS.light)) {
    root.style.removeProperty(varName);
  }
  for (const varName of Object.keys(GRADIENT_COLORS.light)) {
    root.style.removeProperty(varName);
  }
  for (const varName of Object.keys(BASE_COLORS.light)) {
    root.style.removeProperty(varName);
  }
}

export interface HueShiftStore {
  hueShift: () => number | null;
  hueSaturation: () => number;
  setHueShift: (hue: number | null, saturation?: number) => void;
  isAvailable: () => boolean;
}

/**
 * Creates a hue shift store with configurable storage prefix.
 * @param storagePrefix - Prefix for localStorage keys (e.g., "myapp" becomes "myapp_hue_shift")
 */
export function createHueShiftStore(storagePrefix: string): HueShiftStore {
  const STORAGE_KEY = `${storagePrefix}_hue_shift`;
  const STORAGE_KEY_SAT = `${storagePrefix}_hue_saturation`;

  const getInitialHueShift = (): number | null => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed)) return parsed;
    }
    return null;
  };

  const getInitialSaturation = (): number => {
    if (typeof window === "undefined") return 100;
    const saved = localStorage.getItem(STORAGE_KEY_SAT);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed)) return parsed;
    }
    return 100;
  };

  const [hueShift, setHueShiftInternal] = createSignal<number | null>(getInitialHueShift());
  const [hueSaturation, setHueSaturationInternal] = createSignal<number>(getInitialSaturation());

  // Apply hue shift on changes
  createEffect(() => {
    const shift = hueShift();
    const sat = hueSaturation();
    if (typeof window === "undefined") return;

    if (shift === null) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY_SAT);
      resetHueShift();
    } else {
      localStorage.setItem(STORAGE_KEY, String(shift));
      localStorage.setItem(STORAGE_KEY_SAT, String(sat));
      applyHueShift(shift, sat);
    }
  });

  // Re-apply hue shift when theme changes
  if (typeof window !== "undefined") {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          const shift = hueShift();
          const sat = hueSaturation();
          if (shift !== null) {
            requestAnimationFrame(() => applyHueShift(shift, sat));
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }

  const setHueShift = (hue: number | null, saturation: number = 100) => {
    setHueShiftInternal(hue);
    setHueSaturationInternal(saturation);
  };

  return {
    hueShift,
    hueSaturation,
    setHueShift,
    isAvailable: () => checkCspAllowsInlineStyles(),
  };
}

// Default global store for simple usage
let defaultStore: HueShiftStore | null = null;

export function getDefaultHueShiftStore(): HueShiftStore {
  if (!defaultStore) {
    defaultStore = createHueShiftStore("theme");
  }
  return defaultStore;
}

export { resetHueShift };
