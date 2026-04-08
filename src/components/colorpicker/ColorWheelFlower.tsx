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

const COLORS: ColorItem[] = [
  createColorItem("outer-1", "rgb(80,80,80)", 47.631, -27.5),
  createColorItem("outer-2", "rgb(80,60,50)", 27.5, -47.631),
  createColorItem("outer-3", "rgb(80,50,50)", 0, -55),
  createColorItem("outer-4", "rgb(80,50,70)", -27.5, -47.631),
  createColorItem("outer-5", "rgb(70,50,80)", -47.631, -27.5),
  createColorItem("outer-6", "rgb(55,50,80)", -55, 0),
  createColorItem("outer-7", "rgb(50,55,80)", -47.631, 27.5),
  createColorItem("outer-8", "rgb(50,65,80)", -27.5, 47.631),
  createColorItem("outer-9", "rgb(50,80,80)", 0, 55),
  createColorItem("outer-10", "rgb(50,80,65)", 27.5, 47.631),
  createColorItem("outer-11", "rgb(55,80,50)", 47.631, 27.5),
  createColorItem("outer-12", "rgb(70,80,50)", 55, 0),
  createColorItem("middle-1", "rgb(245,245,61)", 34.641, -20),
  createColorItem("middle-2", "rgb(245,153,61)", 20, -34.641),
  createColorItem("middle-3", "rgb(245,61,61)", 0, -40),
  createColorItem("middle-4", "rgb(245,61,153)", -20, -34.641),
  createColorItem("middle-5", "rgb(245,61,245)", -34.641, -20),
  createColorItem("middle-6", "rgb(153,61,245)", -40, 0),
  createColorItem("middle-7", "rgb(61,61,245)", -34.641, 20),
  createColorItem("middle-8", "rgb(61,153,245)", -20, 34.641),
  createColorItem("middle-9", "rgb(61,245,245)", 0, 40),
  createColorItem("middle-10", "rgb(61,245,153)", 20, 34.641),
  createColorItem("middle-11", "rgb(61,245,61)", 34.641, 20),
  createColorItem("middle-12", "rgb(153,245,61)", 40, 0),
  createColorItem("inner-1", "rgb(240,217,194)", 10, -17.3205),
  createColorItem("inner-2", "rgb(240,194,217)", -10, -17.3205),
  createColorItem("inner-3", "rgb(217,194,240)", -20, 0),
  createColorItem("inner-4", "rgb(194,217,240)", -10, 17.3205),
  createColorItem("inner-5", "rgb(194,240,217)", 10, 17.3205),
  createColorItem("inner-6", "rgb(217,240,194)", 20, 0),
  createColorItem("center", "rgb(255,255,255)", 0, 0, { isCenter: true }),
];

const CENTER_INDEX = COLORS.findIndex((item) => item.isCenter);
const MAX_RADIUS = Math.max(
  ...COLORS.map((item) => Math.sqrt(item.offsetX ** 2 + item.offsetY ** 2)),
);
const MAX_WAVE_DISTANCE = MAX_RADIUS * 2;
const MAX_WAVE_DELAY = 0.12;

const RAINBOW_GRADIENT = `conic-gradient(
  from 0deg,
  rgb(245,61,61) 0deg,
  rgb(245,153,61) 30deg,
  rgb(245,245,61) 60deg,
  rgb(61,245,61) 120deg,
  rgb(61,245,245) 180deg,
  rgb(61,61,245) 240deg,
  rgb(245,61,245) 300deg,
  rgb(245,61,61) 360deg
)`;

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

    if (current.hsl.s <= 6 && current.hsl.l >= 95 && CENTER_INDEX >= 0) {
      return CENTER_INDEX;
    }

    let closest = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let index = 0; index < COLORS.length; index += 1) {
      const item = COLORS[index];
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

    const index = COLORS.findIndex(
      (item) => item.hex === selectedHex.toUpperCase(),
    );
    if (index < 0) return;

    triggerPulse(index);

    const selected = selectedIndex();
    const item = COLORS[index];

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

    const selectedItem = COLORS[selected];
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
    if (selected === null) return RAINBOW_GRADIENT;

    const color = COLORS[selected];
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

    const color = COLORS[index].rgb;
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

  const pickerValue = () => COLORS[visualSelectedIndex()]?.hex;

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
        <For each={COLORS}>
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
              const anchorIndex = hoveredIndex();

              let scale = 1;
              let offsetX = 0;
              let offsetY = 0;

              if (anchorIndex !== null && pointerState.active) {
                const anchor = COLORS[anchorIndex];
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

              const anchorIndex = hoveredIndex();
              const pointerState = pointer();
              let delay = 0;

              if (anchorIndex !== null && pointerState.active) {
                const anchor = COLORS[anchorIndex];
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
