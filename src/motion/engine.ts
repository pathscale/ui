import { getMotionDriver } from "./driver";
import { resolveEase } from "./easing";
import type { MotionState, MotionTransition } from "./types";

const resolveDuration = (transition?: MotionTransition) =>
  Math.max(0, (transition?.duration ?? 0) * 1000);

const resolveDelay = (transition?: MotionTransition) =>
  Math.max(0, (transition?.delay ?? 0) * 1000);

const readOpacity = (el: HTMLElement) => {
  const value = Number.parseFloat(getComputedStyle(el).opacity);
  return Number.isFinite(value) ? value : 1;
};

export const runMotion = (
  el: HTMLElement,
  from: MotionState,
  to: MotionState,
  transition?: MotionTransition,
  onComplete?: () => void
) => {
  const duration = resolveDuration(transition);
  const delay = resolveDelay(transition);
  const ease = resolveEase(transition?.easing);
  const driver = getMotionDriver();
  const controls: Array<{ stop: () => void }> = [];

  const shouldTransform =
    from.x !== undefined ||
    from.y !== undefined ||
    from.scale !== undefined ||
    to.x !== undefined ||
    to.y !== undefined ||
    to.scale !== undefined;

  const transformState = {
    x: from.x ?? 0,
    y: from.y ?? 0,
    scale: from.scale ?? 1,
  };

  const applyTransform = () => {
    if (!shouldTransform) return;
    el.style.transform = `translate3d(${transformState.x}px, ${transformState.y}px, 0) scale(${transformState.scale})`;
  };

  if (from.opacity !== undefined) {
    el.style.opacity = String(from.opacity);
  }
  applyTransform();

  const animationTargets = Object.keys(to) as Array<keyof MotionState>;
  if (animationTargets.length === 0) {
    onComplete?.();
    return {
      stop: () => {},
    };
  }

  let remaining = animationTargets.length;
  const handleComplete = () => {
    remaining -= 1;
    if (remaining <= 0) onComplete?.();
  };

  const start = () => {
    animationTargets.forEach((key) => {
      if (key === "opacity") {
        const fromValue =
          from.opacity ?? (to.opacity !== undefined ? readOpacity(el) : 1);
        const control = driver({
          from: fromValue,
          to: to.opacity ?? fromValue,
          duration,
          ease,
          onUpdate: (latest) => {
            el.style.opacity = String(latest);
          },
          onComplete: handleComplete,
        });
        controls.push(control);
        return;
      }

      const fromValue =
        key === "scale"
          ? from.scale ?? 1
          : key === "x"
            ? from.x ?? 0
            : from.y ?? 0;
      const toValue = to[key] ?? fromValue;

      const control = driver({
        from: fromValue,
        to: toValue,
        duration,
        ease,
        onUpdate: (latest) => {
          if (!shouldTransform) return;
          if (key === "x") transformState.x = latest;
          if (key === "y") transformState.y = latest;
          if (key === "scale") transformState.scale = latest;
          applyTransform();
        },
        onComplete: handleComplete,
      });
      controls.push(control);
    });
  };

  let timeoutId: number | null = null;
  if (delay > 0) {
    timeoutId = window.setTimeout(start, delay);
  } else {
    start();
  }

  return {
    stop: () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      controls.forEach((control) => control.stop());
    },
  };
};
