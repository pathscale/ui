import { type Accessor, createSignal, onCleanup, onSettled } from "solid-js";

export type ScrollProgressRange = "start-start/end-end";

export type ScrollProgressOptions = {
  /** Start when the section top reaches the viewport top and end at its bottom. */
  range?: ScrollProgressRange;
};

export type ScrollProgressCallbacks = {
  onProgress: (progress: number) => void;
};

export type ScrollProgressBinding = {
  measure: () => void;
  cleanup: () => void;
};

/** A reactive value from 0 at the range start to 1 at the range end. */
export type ScrollProgress = Accessor<number>;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Check the named view timeline and the exact contain attachment range used by
 * ScrollHorizontal. Returns false in server and partial CSS API environments.
 */
export const supportsViewTimeline = () => {
  const css = globalThis.CSS;
  if (typeof css?.supports !== "function") return false;

  try {
    return (
      css.supports("view-timeline-name", "--motion-progress") &&
      css.supports("view-timeline-axis", "block") &&
      css.supports("animation-timeline", "--motion-progress") &&
      css.supports("animation-range", "contain 0% contain 100%")
    );
  } catch {
    return false;
  }
};

/**
 * Attach scroll progress without depending on a Solid owner. Geometry is read
 * on attach and resize; scroll events only schedule a viewport-top read.
 */
export const attachScrollProgress = (
  section: Element,
  callbacks: ScrollProgressCallbacks,
): ScrollProgressBinding => {
  const view =
    section.ownerDocument?.defaultView ??
    (typeof window === "undefined" ? undefined : window);
  if (!view?.addEventListener || !view.removeEventListener) {
    return { measure: () => {}, cleanup: () => {} };
  }

  const sectionStyle = (section as Element & { style?: CSSStyleDeclaration })
    .style;
  let priorProgress = "";
  let priorPriority = "";
  let ownsStyle = false;
  if (sectionStyle) {
    try {
      priorProgress = sectionStyle.getPropertyValue("--scroll-progress");
      priorPriority = sectionStyle.getPropertyPriority("--scroll-progress");
      sectionStyle.setProperty("--scroll-progress", "0");
      ownsStyle = true;
    } catch {
      // The CSS variable is optional when inline styles are unavailable.
    }
  }

  let sectionHeight = 0;
  let viewportHeight = 0;
  let frameId: number | undefined;
  let active = true;

  const writeProgress = (value: number) => {
    if (!active) return;
    const next = clamp(value, 0, 1);
    try {
      callbacks.onProgress(next);
    } catch {
      // Keep scroll handling alive if a consumer callback fails.
    }
    if (ownsStyle) {
      try {
        sectionStyle?.setProperty("--scroll-progress", String(next));
      } catch {
        // The CSS variable is optional when inline styles are unavailable.
      }
    }
  };

  const update = () => {
    if (!active) return;
    if (sectionHeight <= viewportHeight || viewportHeight <= 0) {
      writeProgress(0);
      return;
    }

    try {
      const sectionTop = section.getBoundingClientRect().top;
      if (!Number.isFinite(sectionTop)) return;
      writeProgress((0 - sectionTop) / (sectionHeight - viewportHeight));
    } catch {
      // Keep the last usable value when a host cannot measure this element.
    }
  };

  const cancelScheduledUpdate = () => {
    if (frameId === undefined) return;
    view.cancelAnimationFrame?.(frameId);
    frameId = undefined;
  };

  const scheduleUpdate = () => {
    if (frameId !== undefined) return;
    if (typeof view.requestAnimationFrame !== "function") {
      update();
      return;
    }

    frameId = view.requestAnimationFrame(() => {
      frameId = undefined;
      update();
    });
  };

  const measure = () => {
    if (!active) return;
    try {
      const rect = section.getBoundingClientRect();
      const measuredHeight = rect.height;
      const elementHeight =
        Number.isFinite(measuredHeight) && measuredHeight > 0
          ? measuredHeight
          : (section as HTMLElement).offsetHeight;
      const measuredViewportHeight = view.innerHeight;

      if (
        !Number.isFinite(elementHeight) ||
        !Number.isFinite(measuredViewportHeight)
      ) {
        return;
      }

      sectionHeight = Math.max(0, elementHeight);
      viewportHeight = Math.max(0, measuredViewportHeight);
      cancelScheduledUpdate();
      update();
    } catch {
      // Missing layout metrics leave the static zero-progress state in place.
    }
  };

  const handleScroll = () => scheduleUpdate();
  const handleResize = () => measure();

  view.addEventListener("scroll", handleScroll, { passive: true });
  view.addEventListener("resize", handleResize);
  measure();

  const cleanup = () => {
    if (!active) return;
    active = false;
    view.removeEventListener("scroll", handleScroll);
    view.removeEventListener("resize", handleResize);
    cancelScheduledUpdate();
    if (sectionStyle && ownsStyle) {
      try {
        if (priorProgress || priorPriority) {
          sectionStyle.setProperty(
            "--scroll-progress",
            priorProgress,
            priorPriority,
          );
        } else {
          sectionStyle.removeProperty("--scroll-progress");
        }
      } catch {
        // The section may already be detached or owned by a host shim.
      }
    }
  };

  return { measure, cleanup };
};

/**
 * Track section progress using one passive scroll listener and at most one
 * pending animation frame. Browser work is installed only after mount.
 */
export const createScrollProgress = (
  target: () => Element | null | undefined,
  _options: ScrollProgressOptions = {},
): ScrollProgress => {
  const [progress, setProgress] = createSignal(0);
  let binding: ScrollProgressBinding | undefined;

  onSettled(() => {
    binding?.cleanup();
    const section = target();
    binding = section
      ? attachScrollProgress(section, { onProgress: setProgress })
      : undefined;
  });

  onCleanup(() => {
    binding?.cleanup();
    binding = undefined;
  });

  return progress;
};
