import "./ColorWheelFlower.css";
import type { JSX } from "@solidjs/web";
import {For, Show, createMemo, createSignal, createTrackedEffect, onCleanup, omit} from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "../../lib/twMerge";
import ColorSwatch from "../color-swatch";
import ColorSwatchPicker from "../color-swatch-picker";
import { useColorPickerContext } from "./colorWheelFlowerContext";
import {
  createColorFromHsl,
  parseColor,
  rgbToHex,
  rgbToHsl,
  type ColorValue,
} from "./ColorUtils";
import {
  type ColorWheelFlowerMode,
  resolveColorWheelFlowerPalette,
} from "./ColorWheelFlower.palette";
import { prefersReducedMotion } from "../../motion";
import { CLASSES } from "./ColorWheelFlower.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ColorWheelFlower.recipe";
import { flowerPetalPosition } from "./ColorWheelFlower.geometry";

export interface ColorWheelFlowerProps {
  /** Stable base for the flower and each interactive petal. */
  id?: string;
  class?: string;
  /** Explicit mode. Omit to follow the root `data-theme` attribute. */
  mode?: ColorWheelFlowerMode;
  /** Exactly 31 literal colors, ordered outer ring, middle ring, inner ring, center. */
  palette?: readonly string[];
}

type ColorItem = {
  id: string;
  rgb: string;
  hex: string;
  // Exact original channels — used so consumers can apply the picked color
  // verbatim without suffering the HSL round-trip drift baked into hslToRgb.
  r: number;
  g: number;
  b: number;
  offsetX: number;
  offsetY: number;
  hue: number;
  saturation: number;
  lightness: number;
  isCenter?: boolean;
};

const parseRgbToHsl = (rgbString: string) => {
  const match = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) {
    return { hue: 0, saturation: 0, lightness: 100 };
  }

  const r = Number.parseInt(match[1], 10);
  const g = Number.parseInt(match[2], 10);
  const b = Number.parseInt(match[3], 10);

  const hsl = rgbToHsl(r, g, b);
  return { hue: hsl.h, saturation: hsl.s, lightness: hsl.l };
};

const createColorItem = (
  id: string,
  color: string,
  offsetX: number,
  offsetY: number,
  options?: { isCenter?: boolean },
): ColorItem => {
  const parsed = parseColor(color) ?? parseColor("#ffffff");
  const r = parsed?.rgb.r ?? 255;
  const g = parsed?.rgb.g ?? 255;
  const b = parsed?.rgb.b ?? 255;
  const rgb = `rgb(${r},${g},${b})`;
  const hsl = parseRgbToHsl(rgb);

  return {
    id,
    rgb,
    hex: rgbToHex(r, g, b).toUpperCase(),
    r,
    g,
    b,
    offsetX,
    offsetY,
    hue: hsl.hue,
    saturation: hsl.saturation,
    lightness: hsl.lightness,
    isCenter: options?.isCenter,
  };
};

const toRgba = (rgb: string, alpha: number) => {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return rgb;
  return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
};

const hueDistance = (a: number, b: number) => {
  const wrapped = Math.abs(a - b) % 360;
  return wrapped > 180 ? 360 - wrapped : wrapped;
};

const isNearColor = (color: ColorValue, item: ColorItem) => {
  const hueDelta = hueDistance(color.hsl.h, item.hue);
  const saturationDelta = Math.abs(color.hsl.s - item.saturation);

  return hueDelta <= 5 && saturationDelta <= 15;
};

// Static layout — positions are the same regardless of theme
interface ColorLayout {
  id: string;
  offsetX: number;
  offsetY: number;
  isCenter?: boolean;
}

const LAYOUT: ColorLayout[] = [
  // Outer ring (12)
  { id: "outer-1", offsetX: 47.631, offsetY: -27.5 },
  { id: "outer-2", offsetX: 27.5, offsetY: -47.631 },
  { id: "outer-3", offsetX: 0, offsetY: -55 },
  { id: "outer-4", offsetX: -27.5, offsetY: -47.631 },
  { id: "outer-5", offsetX: -47.631, offsetY: -27.5 },
  { id: "outer-6", offsetX: -55, offsetY: 0 },
  { id: "outer-7", offsetX: -47.631, offsetY: 27.5 },
  { id: "outer-8", offsetX: -27.5, offsetY: 47.631 },
  { id: "outer-9", offsetX: 0, offsetY: 55 },
  { id: "outer-10", offsetX: 27.5, offsetY: 47.631 },
  { id: "outer-11", offsetX: 47.631, offsetY: 27.5 },
  { id: "outer-12", offsetX: 55, offsetY: 0 },
  // Middle ring (12)
  { id: "middle-1", offsetX: 34.641, offsetY: -20 },
  { id: "middle-2", offsetX: 20, offsetY: -34.641 },
  { id: "middle-3", offsetX: 0, offsetY: -40 },
  { id: "middle-4", offsetX: -20, offsetY: -34.641 },
  { id: "middle-5", offsetX: -34.641, offsetY: -20 },
  { id: "middle-6", offsetX: -40, offsetY: 0 },
  { id: "middle-7", offsetX: -34.641, offsetY: 20 },
  { id: "middle-8", offsetX: -20, offsetY: 34.641 },
  { id: "middle-9", offsetX: 0, offsetY: 40 },
  { id: "middle-10", offsetX: 20, offsetY: 34.641 },
  { id: "middle-11", offsetX: 34.641, offsetY: 20 },
  { id: "middle-12", offsetX: 40, offsetY: 0 },
  // Inner ring (6)
  { id: "inner-1", offsetX: 10, offsetY: -17.3205 },
  { id: "inner-2", offsetX: -10, offsetY: -17.3205 },
  { id: "inner-3", offsetX: -20, offsetY: 0 },
  { id: "inner-4", offsetX: -10, offsetY: 17.3205 },
  { id: "inner-5", offsetX: 10, offsetY: 17.3205 },
  { id: "inner-6", offsetX: 20, offsetY: 0 },
  // Center
  { id: "center", offsetX: 0, offsetY: 0, isCenter: true },
];

function buildColors(palette: readonly string[]): ColorItem[] {
  return LAYOUT.map((layout, i) =>
    createColorItem(
      layout.id,
      palette[i],
      layout.offsetX,
      layout.offsetY,
      layout.isCenter ? { isCenter: true } : undefined,
    ),
  );
}

const CENTER_INDEX = LAYOUT.findIndex((l) => l.isCenter);
const ColorWheelFlower: Layout<typeof componentRecipe, ColorWheelFlowerProps> = () => {

  const context = useColorPickerContext();

  const [selectedIndex, setSelectedIndex] = createSignal<number | null>(null);
  const [pulseState, setPulseState] = createSignal<{
    index: number;
    key: number;
  } | null>(null);

  // Theme-reactive colors
  const [currentTheme, setCurrentTheme] = createSignal<"light" | "dark">(
    typeof document !== "undefined" &&
      document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light",
  );

  // Consumers can pass `mode` directly. Attribute observation is only the
  // browser fallback and must not make the component crash in another renderer.
  if (
    typeof window !== "undefined" &&
    typeof MutationObserver !== "undefined"
  ) {
    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme");
      setCurrentTheme(t === "dark" ? "dark" : "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    onCleanup(() => observer.disconnect());
  }

  const mode = (): ColorWheelFlowerMode => props.mode ?? currentTheme();
  const colors = createMemo(() =>
    buildColors(resolveColorWheelFlowerPalette(mode(), props.palette)),
  );

  const reduceMotion = prefersReducedMotion();
  let pulseTimeout: number | undefined;

  const closestIndex = createMemo(() => {
    const current = context.color();
    const items = colors();

    if (current.hsl.s <= 6 && current.hsl.l >= 95 && CENTER_INDEX >= 0) {
      return CENTER_INDEX;
    }

    let closest = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (item.isCenter) continue;

      const hueDelta = hueDistance(current.hsl.h, item.hue);
      const saturationDelta = Math.abs(current.hsl.s - item.saturation);
      const lightnessDelta = Math.abs(current.hsl.l - item.lightness);
      const score =
        hueDelta * 2.0 + saturationDelta * 1.0 + lightnessDelta * 0.1;

      if (score < bestScore) {
        bestScore = score;
        closest = index;
      }
    }

    return closest;
  });

  const visualSelectedIndex = createMemo(
    () => selectedIndex() ?? closestIndex(),
  );

  const triggerPulse = (index: number) => {
    const pulseKey = Date.now();
    setPulseState({ index, key: pulseKey });

    if (pulseTimeout !== undefined) {
      clearTimeout(pulseTimeout);
    }

    pulseTimeout = window.setTimeout(
      () => {
        setPulseState((prev) =>
          prev?.index === index && prev?.key === pulseKey ? null : prev,
        );
      },
      reduceMotion ? 0 : 220,
    );
  };

  const handlePickerChange = (selectedHex: string) => {
    if (context.disabled()) return;

    const items = colors();
    const index = items.findIndex(
      (item) => item.hex === selectedHex.toUpperCase(),
    );
    if (index < 0) return;

    triggerPulse(index);

    const selected = selectedIndex();
    const item = items[index];

    if (selected === index && !item.isCenter) {
      setSelectedIndex(null);
      context.onChange(createColorFromHsl(0, 0, 100, context.color().hsl.a));
      return;
    }

    setSelectedIndex(index);

    if (item.isCenter) {
      context.onChange(createColorFromHsl(0, 0, 100, context.color().hsl.a));
      return;
    }

    // Build the ColorValue from the item's original integer RGB so the
    // downstream consumer receives the exact Material hex it rendered,
    // not an HSL round-tripped approximation.
    const alpha = context.color().hsl.a;
    context.onChange({
      rgb: { r: item.r, g: item.g, b: item.b, a: alpha },
      hsl: {
        h: item.hue,
        s: item.saturation,
        l: item.lightness,
        a: alpha,
      },
      hex: item.hex,
    });
  };

  createTrackedEffect(() => {
    const selected = selectedIndex();
    const current = context.color();

    if (selected === null) return;

    const selectedItem = colors()[selected];
    if (!selectedItem) return;

    if (!isNearColor(current, selectedItem)) {
      setSelectedIndex(null);
    }
  });

  onCleanup(() => {
    if (pulseTimeout !== undefined) {
      clearTimeout(pulseTimeout);
    }
  });

  const pickerValue = () => colors()[visualSelectedIndex()]?.hex;

  return (
    <div
      id={props.id}
      {...{
        class: twMerge(
          CLASSES.base,
          clsx({ [CLASSES.flag.disabled]: context.disabled() }),
          props.class,
        ),
      }}
      data-slot="color-wheel-flower"
      data-color-mode={mode()}
      data-disabled={context.disabled() ? "true" : "false"}
    >
      <div {...{ class: CLASSES.rings }}>
        <div
          {...{
            class: twMerge(CLASSES.ringShell.base, CLASSES.ringShell.inner),
          }}
        >
          <div {...{ class: twMerge(CLASSES.ring.base, CLASSES.ring.inner) }} />
        </div>
      </div>

      <ColorSwatchPicker
        id={props.id ? `${props.id}-palette` : undefined}
        {...{ class: CLASSES.picker }}
        value={pickerValue()}
        onChange={handlePickerChange}
        state={context.disabled() ? "disabled" : undefined}
        aria-label="Flower color palette"
      >
        <For each={colors()}>
          {(item, index) => {
            const isPulsing = () => pulseState()?.index === index();

            return (
              <div
                {...{
                  class: clsx(
                    CLASSES.dot.base,
                    isPulsing() && "color-wheel-flower__dot--pulsing",
                  ),
                }}
                style={flowerPetalPosition(item.offsetX, item.offsetY)}
              >
                <div {...{ class: CLASSES.dot.frame }}>
                  <div {...{ class: CLASSES.dot.motion }}>
                    <span
                      {...{ class: CLASSES.halo }}
                      style={{
                        "box-shadow": `0 0 8px ${toRgba(item.rgb, 0.3)}, 0 0 3px rgba(255,255,255,0.35)`,
                      }}
                    />

                    <ColorSwatch
                      id={props.id ? `${props.id}-petal-${index()}` : undefined}
                      color={item.hex}
                      size="lg"
                      {...{
                        class: twMerge(
                          CLASSES.swatch.base,
                          item.isCenter && CLASSES.swatch.center,
                        ),
                      }}
                      colorName={
                        item.isCenter
                          ? "Reset to neutral"
                          : `Theme color ${item.hex}`
                      }
                      state={context.disabled() ? "disabled" : undefined}
                    />

                    <span
                      {...{
                        class: clsx(
                          CLASSES.highlight.base,
                          isPulsing() && CLASSES.highlight.pulsing,
                        ),
                      }}
                      style={{ "border-color": item.hex }}
                    />
                  </div>
                </div>
              </div>
            );
          }}
        </For>
      </ColorSwatchPicker>
    </div>
  );
};

export default ColorWheelFlower;
