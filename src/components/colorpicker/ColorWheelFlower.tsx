import {
  type JSX,
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
} from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useColorPickerContext } from "./colorpickerContext";
import { rgbToHsl, createColorFromHsl } from "./ColorUtils";
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
  rgb: string;
  offsetX: number;
  offsetY: number;
  hue: number;
  saturation: number;
  lightness: number;
};


const parseRgbToHsl = (rgbString: string) => {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return { hue: 0, saturation: 0, lightness: 100 };
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  
  const hsl = rgbToHsl(r, g, b);
  return { hue: hsl.h, saturation: hsl.s, lightness: hsl.l };
};

const createColorItem = (
  rgb: string,
  offsetX: number,
  offsetY: number
): ColorItem => ({
  rgb,
  offsetX,
  offsetY,
  ...parseRgbToHsl(rgb),
});

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

const COLORS: ColorItem[] = [
  createColorItem("rgb(245,245,61)", 34.641, -20),
  createColorItem("rgb(245,153,61)", 20, -34.641),
  createColorItem("rgb(245,61,61)", 0, -40),
  createColorItem("rgb(245,61,153)", -20, -34.641),
  createColorItem("rgb(245,61,245)", -34.641, -20),
  createColorItem("rgb(153,61,245)", -40, 0),
  createColorItem("rgb(61,61,245)", -34.641, 20),
  createColorItem("rgb(61,153,245)", -20, 34.641),
  createColorItem("rgb(61,245,245)", 0, 40),
  createColorItem("rgb(61,245,153)", 20, 34.641),
  createColorItem("rgb(61,245,61)", 34.641, 20),
  createColorItem("rgb(153,245,61)", 40, 0),
  createColorItem("rgb(240,217,194)", 10, -17.3205),
  createColorItem("rgb(240,194,217)", -10, -17.3205),
  createColorItem("rgb(217,194,240)", -20, 0),
  createColorItem("rgb(194,217,240)", -10, 17.3205),
  createColorItem("rgb(194,240,217)", 10, 17.3205),
  createColorItem("rgb(217,240,194)", 20, 0),
  createColorItem("rgb(255,255,255)", 0, 0),
];

const MAX_WAVE_DISTANCE =
  Math.max(
    ...COLORS.map((item) => Math.sqrt(item.offsetX ** 2 + item.offsetY ** 2))
  ) * 2;
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
  const reduceMotion = prefersReducedMotion();
  const ringTransition: MotionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: motionDurations.slow, easing: motionEasings.inOut };

  const hoverLift = reduceMotion ? 0 : motionDistances.sm;
  const selectLift = reduceMotion ? 0 : motionDistances.md;
  const pressScale = 0.96;

  let outerRingRef: HTMLDivElement | undefined;
  let outerRingControl: { stop: () => void } | null = null;

  const handleDotClick = (index: number) => {
    if (context.disabled()) return;
    
    if (selectedIndex() === index) {
      setSelectedIndex(null);
      const whiteColor = createColorFromHsl(0, 0, 100, context.color().hsl.a);
      context.onChange(whiteColor);
    } else {
      setSelectedIndex(index);
      const color = COLORS[index];
      
      const newColor = createColorFromHsl(
        color.hue,
        color.saturation,
        color.lightness,
        context.color().hsl.a
      );
      context.onChange(newColor);
    }
  };

  const containerClasses = () =>
    twMerge(
      "relative w-[140px] h-[140px] flex items-center justify-center",
      clsx({
        "opacity-50 cursor-not-allowed": context.disabled(),
      }),
      props.class,
      props.className
    );


  const outerRingBackground = () => {
    const idx = selectedIndex();
    return idx === null 
      ? RAINBOW_GRADIENT 
      : `conic-gradient(${COLORS[idx].rgb}, ${COLORS[idx].rgb})`;
  };

  const outerRingTarget = createMemo<MotionState>(() => {
    if (context.disabled()) {
      return { opacity: 0.5, scale: 1 };
    }
    if (selectedIndex() !== null) {
      return { opacity: 1, scale: 1.06 };
    }
    if (hoveredIndex() !== null) {
      return { opacity: 0.98, scale: 1.03 };
    }
    return { opacity: 0.92, scale: 1 };
  });

  const outerRingGlow = createMemo(() => {
    if (context.disabled()) return "none";
    const idx = hoveredIndex() ?? selectedIndex();
    if (idx === null) {
      return "0 0 12px rgba(255,255,255,0.12)";
    }
    const color = COLORS[idx].rgb;
    return `0 0 12px rgba(255,255,255,0.35), 0 0 28px ${color}`;
  });

  createEffect(() => {
    if (!outerRingRef) return;
    const target = outerRingTarget();
    outerRingControl?.stop();
    outerRingControl = runMotion(
      outerRingRef,
      readMotionState(outerRingRef),
      target,
      ringTransition
    );
  });

  onCleanup(() => {
    outerRingControl?.stop();
  });

  return (
    <div class={containerClasses()}>
      <div class="absolute inset-0">
        <div class="absolute inset-0" style={{ transform: "scale(1.1)" }}>
          <div
            ref={outerRingRef}
            class="absolute inset-0 rounded-full"
            style={{
              background: outerRingBackground(),
              "box-shadow": outerRingGlow(),
              transition: reduceMotion
                ? "none"
                : "background 450ms ease-in-out, box-shadow 300ms ease-out",
            }}
          />
        </div>
        <div class="absolute inset-0" style={{ transform: "scale(0.9)" }}>
          <div
            class="absolute inset-0 rounded-full"
            style={{ background: "#0b1012" }}
          />
        </div>
      </div>

      <div class="relative z-10 w-[calc(100%-5px)] h-[calc(100%-5px)] rounded-full">
        <For each={COLORS}>
          {(item, index) => {
            let motionRef: HTMLDivElement | undefined;
            let dotControl: { stop: () => void } | null = null;

            const isSelected = () => selectedIndex() === index();
            const isHovered = () => hoveredIndex() === index();
            const isPressed = () => pressedIndex() === index();
            const hasSelection = () => selectedIndex() !== null;
            const hasHover = () => hoveredIndex() !== null;

            const dotBaseTarget = createMemo<MotionState>(() => {
              if (context.disabled()) {
                return { opacity: 0.5, scale: 1, x: 0, y: 0 };
              }

              if (isSelected()) {
                const lift = getLiftOffset(item, selectLift);
                return { opacity: 1, scale: 1.18, x: lift.x, y: lift.y };
              }

              if (isHovered()) {
                const lift = getLiftOffset(item, hoverLift);
                return { opacity: 1, scale: 1.1, x: lift.x, y: lift.y };
              }

              if (hasSelection()) {
                return { opacity: 1, scale: 0.98, x: 0, y: 0 };
              }

              if (hasHover()) {
                return { opacity: 1, scale: 0.99, x: 0, y: 0 };
              }

              return { opacity: 1, scale: 1, x: 0, y: 0 };
            });

            const dotTarget = createMemo<MotionState>(() => {
              const base = dotBaseTarget();
              if (!isPressed()) return base;
              return {
                ...base,
                scale: (base.scale ?? 1) * pressScale,
              };
            });

            const glowOpacity = createMemo(() => {
              if (context.disabled()) return 0;
              if (isHovered()) return 1;
              if (isSelected()) return 0.75;
              return 0;
            });

            const dotTransition = (): MotionTransition => {
              if (reduceMotion) return { duration: 0 };
              const anchorIndex = hoveredIndex() ?? selectedIndex();
              let delay = 0;
              if (anchorIndex !== null) {
                const anchor = COLORS[anchorIndex];
                const distance = Math.sqrt(
                  (item.offsetX - anchor.offsetX) ** 2 +
                    (item.offsetY - anchor.offsetY) ** 2
                );
                delay = Math.min(
                  MAX_WAVE_DELAY,
                  (distance / MAX_WAVE_DISTANCE) * MAX_WAVE_DELAY
                );
              }
              if (isSelected()) {
                return {
                  duration: motionDurations.fast,
                  easing: easeOutBack(1.25),
                  delay,
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
                transition
              );
            });

            onCleanup(() => {
              dotControl?.stop();
            });

            return (
              <div
                class="absolute"
                style={{
                  left: `calc(50% + ${item.offsetX}px)`,
                  top: `calc(50% + ${item.offsetY}px)`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  ref={(el) => {
                    motionRef = el;
                  }}
                  class="relative w-[32px] h-[32px]"
                >
                  <span
                    class="absolute rounded-full pointer-events-none"
                    style={{
                      top: "-5px",
                      left: "-5px",
                      right: "-5px",
                      bottom: "-5px",
                      opacity: glowOpacity(),
                      background:
                        "radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 65%)",
                      "box-shadow": `0 0 16px ${item.rgb}, 0 0 6px rgba(255,255,255,0.6)`,
                      transition: reduceMotion
                        ? "none"
                        : "opacity 200ms ease-out, box-shadow 200ms ease-out",
                    }}
                  />
                  <button
                    type="button"
                    tabindex={context.disabled() ? -1 : 0}
                    class={clsx(
                      "w-full h-full rounded-full",
                      "transition-shadow duration-200 ease-out",
                      "focus:outline-none focus:ring-2 focus:ring-white/50",
                      "relative z-10",
                      {
                        "cursor-not-allowed": context.disabled(),
                        "cursor-pointer": !context.disabled(),
                      }
                    )}
                    style={{
                      background: item.rgb,
                      "box-shadow": isSelected()
                        ? "0 6px 16px rgba(0,0,0,0.35)"
                        : isHovered()
                          ? "0 4px 12px rgba(0,0,0,0.3)"
                          : "0 2px 8px rgba(0,0,0,0.3)",
                      transition: reduceMotion ? "none" : "box-shadow 200ms ease-out",
                    }}
                    onClick={() => handleDotClick(index())}
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
                    aria-label={`Select color ${item.rgb}`}
                    aria-pressed={selectedIndex() === index()}
                  >
                    <span
                      class={clsx(
                        "absolute inset-0 rounded-full border-2 border-white",
                        "transition-opacity duration-300 ease-out"
                      )}
                      style={{
                        "mix-blend-mode": "overlay",
                        opacity: selectedIndex() === index() ? "1" : "0",
                      }}
                    />
                  </button>
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};

export default ColorWheelFlower;
