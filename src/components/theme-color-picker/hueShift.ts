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
    console.info("[themeColor] CSP blocks inline styles - theme color customization disabled");
  }

  return cspAllowsInlineStyles;
};

// CSS variables that get overridden when the user picks a theme color.
// Primary/content are set to the picked hex verbatim. Backgrounds and the
// body gradient are mixed with the picked color at low percentages so the
// whole app picks up the hue without going full pastel.
const PRIMARY_VARS = [
  "--color-primary",
  "--nf-accent",
  "--color-nf-accent",
] as const;

const CONTENT_VARS = [
  "--color-primary-content",
  "--nf-on-accent",
  "--color-nf-on-accent",
] as const;

// Per-theme anchor values for the background variables. These match the
// consumer's neutral defaults so the tinted versions stay close to the
// originals when the mix ratio is small. Tuned visually.
type BackgroundVar = {
  name: string;
  anchor: string; // CSS color the picked hex is mixed into
  mix: number; // % of picked color in the mix (0-100)
};

const BACKGROUND_VARS: Record<"light" | "dark", readonly BackgroundVar[]> = {
  light: [
    { name: "--color-base-100", anchor: "oklch(98% 0.001 106.423)", mix: 4 },
    { name: "--color-base-200", anchor: "oklch(97% 0.001 106.424)", mix: 5 },
    { name: "--color-base-300", anchor: "oklch(92% 0.003 48.717)", mix: 7 },
    { name: "--gradient-start", anchor: "#ffffff", mix: 18 },
    { name: "--gradient-end", anchor: "#f5f5f5", mix: 10 },
  ],
  dark: [
    { name: "--color-base-100", anchor: "oklch(13% 0.028 261.692)", mix: 8 },
    { name: "--color-base-200", anchor: "oklch(21% 0.034 264.665)", mix: 9 },
    { name: "--color-base-300", anchor: "oklch(27% 0.033 256.848)", mix: 11 },
    { name: "--gradient-start", anchor: "#0f1420", mix: 20 },
    { name: "--gradient-end", anchor: "#060910", mix: 12 },
  ],
};

function getResolvedTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  const dataTheme = document.documentElement.getAttribute("data-theme");
  if (dataTheme === "dark") return "dark";
  if (dataTheme === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  let h = hex.trim();
  if (h.startsWith("#")) h = h.slice(1);
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  if (h.length !== 6) return null;
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r, g, b };
}

// WCAG 2.1 relative luminance
function relativeLuminance(r: number, g: number, b: number): number {
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

// Pick the readable content color for a given background.
// Compares contrast against white and near-black (#111) and picks the winner.
// Threshold is biased slightly towards white text because mid-tones read
// better against white than against black for most Material 500/600 shades.
function pickContentColor(r: number, g: number, b: number): string {
  const bgL = relativeLuminance(r, g, b);
  const whiteL = 1;
  const darkL = relativeLuminance(0x11, 0x11, 0x11);

  const contrastWithWhite = (whiteL + 0.05) / (bgL + 0.05);
  const contrastWithDark = (bgL + 0.05) / (darkL + 0.05);

  return contrastWithWhite >= contrastWithDark ? "#ffffff" : "#111111";
}

function applyThemeColor(hex: string) {
  if (!checkCspAllowsInlineStyles()) return;

  const rgb = parseHex(hex);
  if (!rgb) return;

  const root = document.documentElement;
  const content = pickContentColor(rgb.r, rgb.g, rgb.b);
  const resolvedTheme = getResolvedTheme();

  for (const varName of PRIMARY_VARS) {
    root.style.setProperty(varName, hex);
  }
  for (const varName of CONTENT_VARS) {
    root.style.setProperty(varName, content);
  }
  for (const { name, anchor, mix } of BACKGROUND_VARS[resolvedTheme]) {
    root.style.setProperty(
      name,
      `color-mix(in oklab, ${hex} ${mix}%, ${anchor})`,
    );
  }
}

function resetHueShift() {
  if (!checkCspAllowsInlineStyles()) return;

  const root = document.documentElement;
  for (const varName of PRIMARY_VARS) {
    root.style.removeProperty(varName);
  }
  for (const varName of CONTENT_VARS) {
    root.style.removeProperty(varName);
  }
  // Background anchors are identical across themes in terms of var names, so
  // clearing one set is enough.
  for (const { name } of BACKGROUND_VARS.light) {
    root.style.removeProperty(name);
  }
}

export interface HueShiftStore {
  /** Current theme color as a hex string, or null when no override is active. */
  themeColor: () => string | null;
  /** Set (or clear with null) the theme color. Hex strings only. */
  setThemeColor: (color: string | null) => void;
  isAvailable: () => boolean;
}

/**
 * Creates a theme color store with configurable storage prefix.
 * @param storagePrefix - Prefix for localStorage keys (e.g., "myapp" becomes "myapp_theme_color")
 */
export function createHueShiftStore(storagePrefix: string): HueShiftStore {
  const STORAGE_KEY = `${storagePrefix}_theme_color`;
  // Legacy keys cleaned up on init so old installs stop bleeding into the new flow.
  const LEGACY_KEYS = [
    `${storagePrefix}_hue_shift`,
    `${storagePrefix}_hue_saturation`,
    `${storagePrefix}_hue_lightness`,
  ];

  const getInitial = (): string | null => {
    if (typeof window === "undefined") return null;
    for (const key of LEGACY_KEYS) {
      localStorage.removeItem(key);
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && parseHex(saved)) return saved;
    return null;
  };

  const [themeColor, setThemeColorInternal] = createSignal<string | null>(getInitial());

  createEffect(() => {
    const color = themeColor();
    if (typeof window === "undefined") return;

    if (color === null) {
      localStorage.removeItem(STORAGE_KEY);
      resetHueShift();
    } else {
      localStorage.setItem(STORAGE_KEY, color);
      applyThemeColor(color);
    }
  });

  // Re-apply theme color when the light/dark theme attribute changes.
  // Background anchors are theme-dependent, so on every theme switch the
  // color-mix() targets need to swap. We schedule this after the current
  // microtask so any concurrent setThemeColor(null) has a chance to flush
  // its null signal first — otherwise we'd race with grayscale buttons
  // that clear the color *and* switch the theme in one click.
  if (typeof window !== "undefined") {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          requestAnimationFrame(() => {
            const color = themeColor();
            if (color !== null) {
              applyThemeColor(color);
            }
          });
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }

  const setThemeColor = (color: string | null) => {
    if (color === null) {
      setThemeColorInternal(null);
      return;
    }
    if (!parseHex(color)) return;
    setThemeColorInternal(color);
  };

  return {
    themeColor,
    setThemeColor,
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
