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

const toRgba = (rgb: string, alpha: number) => {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return rgb;
  return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
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

const MAX_RADIUS = Math.max(
  ...COLORS.map((item) => Math.sqrt(item.offsetX ** 2 + item.offsetY ** 2))
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
  const [pointer, setPointer] = createSignal({
    x: 0,
    y: 0,
    active: false,
  });
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

  const handleDotClick = (index: number) => {
    if (context.disabled()) return;
    const pulseKey = Date.now();
    setPulseState({ index, key: pulseKey });
    if (pulseTimeout !== undefined) {
      clearTimeout(pulseTimeout);
    }
    pulseTimeout = window.setTimeout(() => {
      setPulseState((prev) =>
        prev?.index === index && prev?.key === pulseKey ? null : prev
      );
    }, reduceMotion ? 0 : 220);
    
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
      return { opacity: 1, scale: 1 };
    }
    if (hoveredIndex() !== null) {
      return { opacity: 0.98, scale: 0.84 };
    }
    return { opacity: 0.92, scale: 0.84 };
  });

  const outerRingGlow = createMemo(() => {
    if (context.disabled()) return "none";
    const idx = hoveredIndex() ?? selectedIndex();
    if (idx === null) {
      return "0 0 10px rgba(255,255,255,0.08)";
    }
    const color = COLORS[idx].rgb;
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
      ringTransition
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

  return (
    <div
      ref={containerRef}
      class={containerClasses()}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
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

            const isHovered = () => hoveredIndex() === index();
            const isPressed = () => pressedIndex() === index();
            const isSelected = () => selectedIndex() === index();
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
                    (item.offsetY - anchor.offsetY) ** 2
                );
                const waveRadius = MAX_RADIUS * 0.9;
                const influence = Math.max(0, 1 - distance / waveRadius);

                if (influence > 0) {
                  const maxDelta = 16;
                  const deltaX = Math.max(
                    -maxDelta,
                    Math.min(maxDelta, pointerState.x - anchor.offsetX)
                  );
                  const deltaY = Math.max(
                    -maxDelta,
                    Math.min(maxDelta, pointerState.y - anchor.offsetY)
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
                    (item.offsetY - anchor.offsetY) ** 2
                );
                delay = Math.min(
                  MAX_WAVE_DELAY,
                  (distance / MAX_WAVE_DISTANCE) * MAX_WAVE_DELAY
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
                  class="relative w-[32px] h-[32px]"
                >
                  <div
                    ref={(el) => {
                      motionRef = el;
                    }}
                    class="relative w-full h-full"
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
                          "radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%)",
                        "box-shadow": `0 0 8px ${toRgba(item.rgb, 0.3)}, 0 0 3px rgba(255,255,255,0.35)`,
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
                        "box-shadow": isHovered() || isPulsing()
                          ? "0 3px 10px rgba(0,0,0,0.25)"
                          : "0 2px 8px rgba(0,0,0,0.25)",
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
                          opacity: isHovered() ? "0.75" : isPulsing() ? "0.45" : "0",
                          "box-shadow": isHovered()
                            ? "0 0 6px rgba(255,255,255,0.45)"
                            : isPulsing()
                              ? "0 0 4px rgba(255,255,255,0.35)"
                              : "none",
                        }}
                      />
                    </button>
                  </div>
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
