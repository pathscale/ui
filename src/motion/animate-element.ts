import { prefersReducedMotion } from "./reduced-motion";
import { motionDurations, motionEasings } from "./tokens";
import type { MotionEasing } from "./types";

export type AnimateElementOptions = Omit<KeyframeAnimationOptions, "easing"> & {
  /** CSS timing keywords; function easings are provided by the JS motion driver. */
  easing?: Exclude<MotionEasing, (t: number) => number>;
  /** Finish at the final keyframe when the live reduced-motion setting turns on. */
  respectReducedMotion?: boolean;
};

export type ElementAnimation = {
  cancel: () => void;
  /** Resolves when the animation ends or is cancelled. */
  finished: Promise<void>;
};

const isKeyframeMetadata = (property: string) =>
  property === "offset" ||
  property === "easing" ||
  property === "composite" ||
  property === "computedOffset";

const finalValue = (value: unknown) => {
  if (Array.isArray(value)) {
    for (let index = value.length - 1; index >= 0; index -= 1) {
      if (value[index] !== null && value[index] !== undefined)
        return value[index];
    }
    return undefined;
  }
  return value;
};

const applyFinalKeyframe = (
  element: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
) => {
  const style = (element as Element & { style?: CSSStyleDeclaration }).style;
  if (!style) return;

  const finalValues = new Map<string, unknown>();
  if (Array.isArray(keyframes)) {
    for (let index = keyframes.length - 1; index >= 0; index -= 1) {
      const frame = keyframes[index] as Keyframe & Record<string, unknown>;
      for (const [property, value] of Object.entries(frame)) {
        if (
          !isKeyframeMetadata(property) &&
          !finalValues.has(property) &&
          value !== null &&
          value !== undefined
        ) {
          finalValues.set(property, value);
        }
      }
    }
  } else {
    for (const [property, value] of Object.entries(keyframes)) {
      if (!isKeyframeMetadata(property)) {
        finalValues.set(property, finalValue(value));
      }
    }
  }

  for (const [property, value] of finalValues) {
    if (value === null || value === undefined) continue;
    const text = String(value);
    if (property.startsWith("--") || property.includes("-")) {
      style.setProperty(property, text);
    } else {
      (style as unknown as Record<string, string>)[property] = text;
    }
  }
};

const createCompletedAnimation = (): ElementAnimation => ({
  cancel: () => {},
  finished: Promise.resolve(),
});

/** Animate an element with WAAPI, using the library's base timing tokens by default. */
export const animateElement = (
  element: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: AnimateElementOptions = {},
): ElementAnimation => {
  const {
    respectReducedMotion = true,
    duration = motionDurations.base * 1000,
    easing = motionEasings.out as Exclude<MotionEasing, (t: number) => number>,
    ...timing
  } = options;

  const animate = (element as Element & { animate?: Element["animate"] })
    .animate;
  if (
    typeof animate !== "function" ||
    (respectReducedMotion && prefersReducedMotion())
  ) {
    applyFinalKeyframe(element, keyframes);
    return createCompletedAnimation();
  }

  let animation: Animation;
  try {
    animation = animate.call(element, keyframes, {
      ...timing,
      duration,
      easing,
    });
  } catch {
    applyFinalKeyframe(element, keyframes);
    return createCompletedAnimation();
  }

  let settled = false;
  let resolveFinished: () => void = () => {};
  let removeMotionListener = () => {};
  const finished = new Promise<void>((resolve) => {
    resolveFinished = resolve;
  });
  const settle = () => {
    if (settled) return;
    settled = true;
    removeMotionListener();
    resolveFinished();
  };

  let media: MediaQueryList | undefined;
  if (respectReducedMotion && typeof globalThis.matchMedia === "function") {
    try {
      media = globalThis.matchMedia("(prefers-reduced-motion: reduce)");
    } catch {
      media = undefined;
    }
  }
  const handleMotionChange = (event: MediaQueryListEvent | MediaQueryList) => {
    if (!event.matches || settled) return;
    applyFinalKeyframe(element, keyframes);
    animation.cancel();
    settle();
  };
  removeMotionListener = () => {
    if (!media) return;
    if (typeof media.removeEventListener === "function") {
      media.removeEventListener("change", handleMotionChange);
    } else {
      media.removeListener?.(handleMotionChange);
    }
  };

  if (media?.matches) {
    handleMotionChange(media);
  } else if (media && typeof media.addEventListener === "function") {
    media.addEventListener("change", handleMotionChange);
  } else if (media && typeof media.addListener === "function") {
    media.addListener(handleMotionChange);
  }

  const animationFinished = animation.finished;
  if (animationFinished && typeof animationFinished.then === "function") {
    void animationFinished.then(settle, settle);
  } else {
    settle();
  }

  const cancel = () => {
    if (settled) return;
    animation.cancel();
    removeMotionListener();
    settle();
  };

  return { cancel, finished };
};
