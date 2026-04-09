import "./ColorWheelFlower.css";
import {
  type JSX,
  For,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import ColorSwatch from "../color-swatch";
import ColorSwatchPicker from "../color-swatch-picker";
import { useColorPickerContext } from "./colorpickerContext";
import {
  createColorFromHsl,
  rgbToHex,
  rgbToHsl,
  type ColorValue,
} from "./ColorUtils";
import {
  motionDistances,
  motionDurations,
  motionEasings,
  prefersReducedMotion,
  runMotion,
  type MotionState,
  type MotionTransition,
} from "../../motion";

export interface ColorWheelFlowerProps {
  class?: string;
  className?: string;
}

type ColorItem = {
  id: string;
  rgb: string;
  hex: string;
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
  rgb: string,
  offsetX: number,
  offsetY: number,
  options?: { isCenter?: boolean },
): ColorItem => {
  const hsl = parseRgbToHsl(rgb);
  const rgbMatch = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  const r = Number.parseInt(rgbMatch?.[1] ?? "255", 10);
  const g = Number.parseInt(rgbMatch?.[2] ?? "255", 10);
  const b = Number.parseInt(rgbMatch?.[3] ?? "255", 10);

  return {
    id,
    rgb,
    hex: rgbToHex(r, g, b).toUpperCase(),
    offsetX,
    offsetY,
    hue: hsl.hue,
    saturation: hsl.saturation,
    lightness: hsl.lightness,
    isCenter: options?.isCenter,
  };
};

const readMotionState = (el: HTMLElement): MotionState => {
  const styles = getComputedStyle(el);
  const opacityValue = Number.parseFloat(styles.opacity);
  const opacity = Number.isFinite(opacityValue) ? opacityValue : 1;
  const transform = styles.transform;

  if (!transform || transform === "none") {
    return { opacity, x: 0, y: 0, scale: 1 };
  }

  if (typeof DOMMatrixReadOnly !== "undefined") {
    const matrix = new DOMMatrixReadOnly(transform);
    return { opacity, x: matrix.m41, y: matrix.m42, scale: matrix.a };
  }

  const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
  if (!matrixMatch) {
    return { opacity, x: 0, y: 0, scale: 1 };
  }

  const values = matrixMatch[1]
    .split(",")
    .map((value) => Number.parseFloat(value.trim()));

  return {
    opacity,
    scale: Number.isFinite(values[0]) ? values[0] : 1,
    x: Number.isFinite(values[4]) ? values[4] : 0,
    y: Number.isFinite(values[5]) ? values[5] : 0,
  };
};

const getLiftOffset = (item: ColorItem, distance: number) => {
  const radius = Math.sqrt(item.offsetX ** 2 + item.offsetY ** 2);
  if (!Number.isFinite(radius) || radius === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: (item.offsetX / radius) * distance,
    y: (item.offsetY / radius) * distance,
  };
};

const easeOutBack = (overshoot = 1.4) => (t: number) => {
  const c1 = overshoot;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
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
  const lightnessDelta = Math.abs(color.hsl.l - item.lightness);

  return hueDelta <= 2 && saturationDelta <= 2 && lightnessDelta <= 2;
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
  { id: "outer-1",  offsetX: 47.631,  offsetY: -27.5 },
  { id: "outer-2",  offsetX: 27.5,    offsetY: -47.631 },
  { id: "outer-3",  offsetX: 0,       offsetY: -55 },
  { id: "outer-4",  offsetX: -27.5,   offsetY: -47.631 },
  { id: "outer-5",  offsetX: -47.631, offsetY: -27.5 },
  { id: "outer-6",  offsetX: -55,     offsetY: 0 },
  { id: "outer-7",  offsetX: -47.631, offsetY: 27.5 },
  { id: "outer-8",  offsetX: -27.5,   offsetY: 47.631 },
  { id: "outer-9",  offsetX: 0,       offsetY: 55 },
  { id: "outer-10", offsetX: 27.5,    offsetY: 47.631 },
  { id: "outer-11", offsetX: 47.631,  offsetY: 27.5 },
  { id: "outer-12", offsetX: 55,      offsetY: 0 },
  // Middle ring (12)
  { id: "middle-1",  offsetX: 34.641,  offsetY: -20 },
  { id: "middle-2",  offsetX: 20,      offsetY: -34.641 },
  { id: "middle-3",  offsetX: 0,       offsetY: -40 },
  { id: "middle-4",  offsetX: -20,     offsetY: -34.641 },
  { id: "middle-5",  offsetX: -34.641, offsetY: -20 },
  { id: "middle-6",  offsetX: -40,     offsetY: 0 },
  { id: "middle-7",  offsetX: -34.641, offsetY: 20 },
  { id: "middle-8",  offsetX: -20,     offsetY: 34.641 },
  { id: "middle-9",  offsetX: 0,       offsetY: 40 },
  { id: "middle-10", offsetX: 20,      offsetY: 34.641 },
  { id: "middle-11", offsetX: 34.641,  offsetY: 20 },
  { id: "middle-12", offsetX: 40,      offsetY: 0 },
  // Inner ring (6)
  { id: "inner-1", offsetX: 10,  offsetY: -17.3205 },
  { id: "inner-2", offsetX: -10, offsetY: -17.3205 },
  { id: "inner-3", offsetX: -20, offsetY: 0 },
  { id: "inner-4", offsetX: -10, offsetY: 17.3205 },
  { id: "inner-5", offsetX: 10,  offsetY: 17.3205 },
  { id: "inner-6", offsetX: 20,  offsetY: 0 },
  // Center
  { id: "center", offsetX: 0, offsetY: 0, isCenter: true },
];

// Material Design 2 color palette — Light theme
// Outer: Material 800, Middle: Material 500, Inner: Material 200
const LIGHT_RGBS: string[] = [
  // Outer — Material 800
  "rgb(249,168,37)",  // Yellow 800
  "rgb(239,108,0)",   // Orange 800
  "rgb(198,40,40)",   // Red 800
  "rgb(173,20,87)",   // Pink 800
  "rgb(106,27,154)",  // Purple 800
  "rgb(69,39,160)",   // Deep Purple 800
  "rgb(40,53,147)",   // Indigo 800
  "rgb(21,101,192)",  // Blue 800
  "rgb(0,131,143)",   // Cyan 800
  "rgb(0,105,92)",    // Teal 800
  "rgb(46,125,50)",   // Green 800
  "rgb(85,139,47)",   // Light Green 800
  // Middle — Material 500
  "rgb(255,235,59)",  // Yellow
  "rgb(255,152,0)",   // Orange
  "rgb(244,67,54)",   // Red
  "rgb(233,30,99)",   // Pink
  "rgb(156,39,176)",  // Purple
  "rgb(103,58,183)",  // Deep Purple
  "rgb(63,81,181)",   // Indigo
  "rgb(33,150,243)",  // Blue
  "rgb(0,188,212)",   // Cyan
  "rgb(0,150,136)",   // Teal
  "rgb(76,175,80)",   // Green
  "rgb(139,195,74)",  // Light Green
  // Inner — Material 200
  "rgb(239,154,154)", // Red 200
  "rgb(206,147,216)", // Purple 200
  "rgb(144,202,249)", // Blue 200
  "rgb(128,222,234)", // Cyan 200
  "rgb(165,214,167)", // Green 200
  "rgb(255,224,130)", // Amber 200
  // Center
  "rgb(255,255,255)",
];

// Material Design 2 color palette — Dark theme
// Outer: Material 400, Middle: Material 200, Inner: Material 100
const DARK_RGBS: string[] = [
  // Outer — Material 400
  "rgb(255,238,88)",  // Yellow 400
  "rgb(255,167,38)",  // Orange 400
  "rgb(239,83,80)",   // Red 400
  "rgb(236,64,122)",  // Pink 400
  "rgb(171,71,188)",  // Purple 400
  "rgb(126,87,194)",  // Deep Purple 400
  "rgb(92,107,192)",  // Indigo 400
  "rgb(66,165,245)",  // Blue 400
  "rgb(38,198,218)",  // Cyan 400
  "rgb(38,166,154)",  // Teal 400
  "rgb(102,187,106)", // Green 400
  "rgb(156,204,101)", // Light Green 400
  // Middle — Material 200
  "rgb(255,245,157)", // Yellow 200
  "rgb(255,204,128)", // Orange 200
  "rgb(239,154,154)", // Red 200
  "rgb(244,143,177)", // Pink 200
  "rgb(206,147,216)", // Purple 200
  "rgb(179,157,219)", // Deep Purple 200
  "rgb(159,168,218)", // Indigo 200
  "rgb(144,202,249)", // Blue 200
  "rgb(128,222,234)", // Cyan 200
  "rgb(128,203,196)", // Teal 200
  "rgb(165,214,167)", // Green 200
  "rgb(197,225,165)", // Light Green 200
  // Inner — Material 100
  "rgb(255,205,210)", // Red 100
  "rgb(225,190,231)", // Purple 100
  "rgb(187,222,251)", // Blue 100
  "rgb(178,235,242)", // Cyan 100
  "rgb(200,230,201)", // Green 100
  "rgb(255,236,179)", // Amber 100
  // Center
  "rgb(255,255,255)",
];

const LIGHT_RAINBOW = `conic-gradient(
  from 0deg,
  rgb(244,67,54) 0deg,
  rgb(255,152,0) 30deg,
  rgb(255,235,59) 60deg,
  rgb(76,175,80) 120deg,
  rgb(0,188,212) 180deg,
  rgb(63,81,181) 240deg,
  rgb(156,39,176) 300deg,
  rgb(244,67,54) 360deg
)`;

const DARK_RAINBOW = `conic-gradient(
  from 0deg,
  rgb(239,154,154) 0deg,
  rgb(255,204,128) 30deg,
  rgb(255,245,157) 60deg,
  rgb(165,214,167) 120deg,
  rgb(128,222,234) 180deg,
  rgb(159,168,218) 240deg,
  rgb(206,147,216) 300deg,
  rgb(239,154,154) 360deg
)`;

function buildColors(rgbs: string[]): ColorItem[] {
  return LAYOUT.map((layout, i) =>
    createColorItem(layout.id, rgbs[i], layout.offsetX, layout.offsetY, layout.isCenter ? { isCenter: true } : undefined)
  );
}

const CENTER_INDEX = LAYOUT.findIndex((l) => l.isCenter);
const MAX_RADIUS = Math.max(
  ...LAYOUT.map((l) => Math.sqrt(l.offsetX ** 2 + l.offsetY ** 2)),
);
const MAX_WAVE_DISTANCE = MAX_RADIUS * 2;
const MAX_WAVE_DELAY = 0.12;

const ColorWheelFlower = (props: ColorWheelFlowerProps): JSX.Element => {
  const context = useColorPickerContext();

  const [selectedIndex, setSelectedIndex] = createSignal<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = createSignal<number | null>(null);
  const [pressedIndex, setPressedIndex] = createSignal<number | null>(null);
  const [pointer, setPointer] = createSignal({ x: 0, y: 0, active: false });
  const [pulseState, setPulseState] = createSignal<{
    index: number;
    key: number;
  } | null>(null);

  // Theme-reactive colors
  const [currentTheme, setCurrentTheme] = createSignal<"light" | "dark">(
    typeof document !== "undefined"
      ? (document.documentElement.getAttribute("data-theme") as "light" | "dark") ?? "light"
      : "light"
  );

  if (typeof window !== "undefined") {
    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme");
      setCurrentTheme(t === "dark" ? "dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    onCleanup(() => observer.disconnect());
  }

  const colors = createMemo(() =>
    buildColors(currentTheme() === "dark" ? DARK_RGBS : LIGHT_RGBS)
  );

  const rainbowGradient = () =>
    currentTheme() === "dark" ? DARK_RAINBOW : LIGHT_RAINBOW;

  const reduceMotion = prefersReducedMotion();
  const ringTransition: MotionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: motionDurations.slow, easing: motionEasings.inOut };

  const hoverLift = reduceMotion ? 0 : motionDistances.sm;
  const pressScale = 0.96;
  const pulseScale = 1.12;

  let containerRef: HTMLDivElement | undefined;
  let pointerTimeout: number | undefined;
  let pulseTimeout: number | undefined;
  let outerRingRef: HTMLDivElement | undefined;
  let outerRingControl: { stop: () => void } | null = null;

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
      const score = hueDelta * 1.4 + saturationDelta * 0.8 + lightnessDelta * 0.55;

      if (score < bestScore) {
        bestScore = score;
        closest = index;
      }
    }

    return closest;
  });

  const visualSelectedIndex = createMemo(() => selectedIndex() ?? closestIndex());

  const triggerPulse = (index: number) => {
    const pulseKey = Date.now();
    setPulseState({ index, key: pulseKey });

    if (pulseTimeout !== undefined) {
      clearTimeout(pulseTimeout);
    }

    pulseTimeout = window.setTimeout(() => {
      setPulseState((prev) =>
        prev?.index === index && prev?.key === pulseKey ? null : prev,
      );
    }, reduceMotion ? 0 : 220);
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

    context.onChange(
      createColorFromHsl(
        item.hue,
        item.saturation,
        item.lightness,
        context.color().hsl.a,
      ),
    );
  };

  createEffect(() => {
    const selected = selectedIndex();
    const current = context.color();

    if (selected === null) return;

    const selectedItem = colors()[selected];
    if (!selectedItem) return;

    if (!isNearColor(current, selectedItem)) {
      setSelectedIndex(null);
    }
  });

  const handlePointerMove = (event: MouseEvent) => {
    if (!containerRef) return;

    const rect = containerRef.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    setPointer({ x, y, active: true });

    if (pointerTimeout !== undefined) {
      clearTimeout(pointerTimeout);
    }

    pointerTimeout = window.setTimeout(() => {
      setPointer((prev) => ({ ...prev, active: false }));
    }, 120);
  };

  const handlePointerLeave = () => {
    setPointer((prev) => ({ ...prev, active: false }));
    setHoveredIndex(null);

    if (pointerTimeout !== undefined) {
      clearTimeout(pointerTimeout);
    }
  };

  const outerRingBackground = () => {
    const selected = selectedIndex();
    if (selected === null) return rainbowGradient();

    const color = colors()[selected];
    return `conic-gradient(${color.rgb}, ${color.rgb})`;
  };

  const outerRingTarget = createMemo<MotionState>(() => {
    if (context.disabled()) {
      return { opacity: 0.5, scale: 1 };
    }
    if (selectedIndex() !== null) {
      return { opacity: 1, scale: 1 };
    }
    if (hoveredIndex() !== null) {
      return { opacity: 0.98, scale: 0.84 };
    }
    return { opacity: 0.92, scale: 0.84 };
  });

  const outerRingGlow = createMemo(() => {
    if (context.disabled()) return "none";

    const index = hoveredIndex() ?? selectedIndex();
    if (index === null) {
      return "0 0 10px rgba(255,255,255,0.08)";
    }

    const color = colors()[index].rgb;
    return `0 0 10px rgba(255,255,255,0.16), 0 0 20px ${toRgba(color, 0.35)}`;
  });

  createEffect(() => {
    if (!outerRingRef) return;

    const target = outerRingTarget();
    outerRingControl?.stop();
    outerRingControl = runMotion(
      outerRingRef,
      readMotionState(outerRingRef),
      target,
      ringTransition,
    );
  });

  onCleanup(() => {
    outerRingControl?.stop();

    if (pulseTimeout !== undefined) {
      clearTimeout(pulseTimeout);
    }

    if (pointerTimeout !== undefined) {
      clearTimeout(pointerTimeout);
    }
  });

  const pickerValue = () => colors()[visualSelectedIndex()]?.hex;

  return (
    <div
      ref={containerRef}
      class={twMerge(
        "color-wheel-flower",
        clsx({ "color-wheel-flower--disabled": context.disabled() }),
        props.class,
        props.className,
      )}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      data-slot="color-wheel-flower"
      data-disabled={context.disabled() ? "true" : "false"}
    >
      <div class="color-wheel-flower__rings">
        <div class="color-wheel-flower__ring-shell color-wheel-flower__ring-shell--outer">
          <div
            ref={outerRingRef}
            class="color-wheel-flower__ring color-wheel-flower__ring--outer"
            style={{
              background: outerRingBackground(),
              "box-shadow": outerRingGlow(),
              transition: reduceMotion
                ? "none"
                : "background 450ms ease-in-out, box-shadow 300ms ease-out",
            }}
          />
        </div>

        <div class="color-wheel-flower__ring-shell color-wheel-flower__ring-shell--inner">
          <div class="color-wheel-flower__ring color-wheel-flower__ring--inner" />
        </div>
      </div>

      <ColorSwatchPicker
        class="color-wheel-flower__picker"
        value={pickerValue()}
        onChange={handlePickerChange}
        isDisabled={context.disabled()}
        aria-label="Flower color palette"
      >
        <For each={colors()}>
          {(item, index) => {
            let motionRef: HTMLDivElement | undefined;
            let dotControl: { stop: () => void } | null = null;

            const isHovered = () => hoveredIndex() === index();
            const isPressed = () => pressedIndex() === index();
            const isPulsing = () => pulseState()?.index === index();

            const dotBaseTarget = createMemo<MotionState>(() => {
              if (context.disabled()) {
                return { opacity: 0.5, scale: 1, x: 0, y: 0 };
              }

              const pointerState = pointer();
              const anchorIdx = hoveredIndex();

              let scale = 1;
              let offsetX = 0;
              let offsetY = 0;

              if (anchorIdx !== null && pointerState.active) {
                const anchor = colors()[anchorIdx];
                const distance = Math.sqrt(
                  (item.offsetX - anchor.offsetX) ** 2 +
                    (item.offsetY - anchor.offsetY) ** 2,
                );

                const waveRadius = MAX_RADIUS * 0.9;
                const influence = Math.max(0, 1 - distance / waveRadius);

                if (influence > 0) {
                  const maxDelta = 16;
                  const deltaX = Math.max(
                    -maxDelta,
                    Math.min(maxDelta, pointerState.x - anchor.offsetX),
                  );
                  const deltaY = Math.max(
                    -maxDelta,
                    Math.min(maxDelta, pointerState.y - anchor.offsetY),
                  );

                  const waveStrength = isHovered() ? 0.25 : 0.18;
                  offsetX += deltaX * influence * waveStrength;
                  offsetY += deltaY * influence * waveStrength;

                  const liftStrength = isHovered() ? 0.8 : 0.35;
                  const lift = getLiftOffset(item, hoverLift * liftStrength);
                  offsetX += lift.x * influence;
                  offsetY += lift.y * influence;

                  const scaleBoost = isHovered() ? 0.06 : 0.03;
                  scale += influence * scaleBoost;
                }
              }

              return { opacity: 1, scale, x: offsetX, y: offsetY };
            });

            const dotTarget = createMemo<MotionState>(() => {
              const base = dotBaseTarget();
              let scale = base.scale ?? 1;

              if (isPulsing()) {
                scale *= pulseScale;
              }
              if (isPressed()) {
                scale *= pressScale;
              }

              return {
                ...base,
                scale,
              };
            });

            const glowOpacity = createMemo(() => {
              if (context.disabled()) return 0;
              if (isHovered()) return 0.6;
              if (isPulsing()) return 0.35;
              return 0;
            });

            const dotTransition = (): MotionTransition => {
              if (reduceMotion) return { duration: 0 };

              const anchorIdx = hoveredIndex();
              const pointerState = pointer();
              let delay = 0;

              if (anchorIdx !== null && pointerState.active) {
                const anchor = colors()[anchorIdx];
                const distance = Math.sqrt(
                  (item.offsetX - anchor.offsetX) ** 2 +
                    (item.offsetY - anchor.offsetY) ** 2,
                );

                delay = Math.min(
                  MAX_WAVE_DELAY,
                  (distance / MAX_WAVE_DISTANCE) * MAX_WAVE_DELAY,
                );
              }

              if (isPulsing()) {
                return {
                  duration: motionDurations.fast,
                  easing: easeOutBack(1.25),
                };
              }

              if (isHovered()) {
                return {
                  duration: motionDurations.fast,
                  easing: motionEasings.out,
                  delay,
                };
              }

              return {
                duration: motionDurations.base,
                easing: motionEasings.out,
                delay,
              };
            };

            createEffect(() => {
              if (!motionRef) return;

              const target = dotTarget();
              const transition = dotTransition();
              dotControl?.stop();
              dotControl = runMotion(
                motionRef,
                readMotionState(motionRef),
                target,
                transition,
              );
            });

            onCleanup(() => {
              dotControl?.stop();
            });

            return (
              <div
                class="color-wheel-flower__dot"
                style={{
                  left: `calc(50% + ${item.offsetX}px)`,
                  top: `calc(50% + ${item.offsetY}px)`,
                }}
              >
                <div class="color-wheel-flower__dot-frame">
                  <div
                    ref={(el) => {
                      motionRef = el;
                    }}
                    class="color-wheel-flower__dot-motion"
                  >
                    <span
                      class="color-wheel-flower__halo"
                      style={{
                        opacity: glowOpacity(),
                        "box-shadow": `0 0 8px ${toRgba(item.rgb, 0.3)}, 0 0 3px rgba(255,255,255,0.35)`,
                        transition: reduceMotion
                          ? "none"
                          : "opacity 200ms ease-out, box-shadow 200ms ease-out",
                      }}
                    />

                    <ColorSwatch
                      color={item.hex}
                      size="lg"
                      class={twMerge(
                        "color-wheel-flower__swatch",
                        item.isCenter && "color-wheel-flower__swatch--center",
                      )}
                      colorName={item.isCenter ? "Reset to neutral" : `Theme color ${item.hex}`}
                      isDisabled={context.disabled()}
                      onMouseEnter={() => {
                        if (!context.disabled()) {
                          setHoveredIndex(index());
                        }
                      }}
                      onMouseLeave={() => {
                        if (!context.disabled()) {
                          setHoveredIndex(null);
                        }
                      }}
                      onFocus={() => {
                        if (!context.disabled()) {
                          setHoveredIndex(index());
                        }
                      }}
                      onBlur={() => {
                        if (!context.disabled()) {
                          setHoveredIndex(null);
                        }
                      }}
                      onPointerDown={() => {
                        if (!context.disabled()) {
                          setPressedIndex(index());
                        }
                      }}
                      onPointerUp={() => {
                        if (!context.disabled()) {
                          setPressedIndex(null);
                        }
                      }}
                      onPointerLeave={() => {
                        if (!context.disabled()) {
                          setPressedIndex(null);
                        }
                      }}
                      onPointerCancel={() => {
                        if (!context.disabled()) {
                          setPressedIndex(null);
                        }
                      }}
                    />

                    <span
                      class={clsx(
                        "color-wheel-flower__highlight",
                        isHovered() && "color-wheel-flower__highlight--hovered",
                        isPulsing() && "color-wheel-flower__highlight--pulsing",
                      )}
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
