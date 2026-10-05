import "./ScrollHorizontal.css";
import type { JSX } from "@solidjs/web";
import {
  type Component,
  createMemo,
  createSignal,
  omit,
  onCleanup,
  onSettled,
  Show,
} from "solid-js";
import type { Layout } from "../../lib/layouts";
import {
  attachScrollProgress,
  supportsViewTimeline,
  type ScrollProgressBinding as ScrollProgressHandle,
} from "../../motion/scroll-progress";
import type { UIBaseProps } from "../vocabulary";
import { componentRecipe } from "./ScrollHorizontal.recipe";

export type ScrollHorizontalProps = UIBaseProps &
  Omit<JSX.HTMLAttributes<HTMLElement>, "class" | "style" | "height"> & {
    itemWidth?: number;
    mobileItemWidth?: number;
    gap?: number;
    mobileGap?: number;
    height?: number | string;
  };

const ScrollProgressBinding: Component<{
  target: () => HTMLElement | undefined;
  onProgress: (progress: number) => void;
  onDispose: () => void;
}> = (props) => {
  let binding: ScrollProgressHandle | undefined;

  onSettled(() => {
    binding?.cleanup();
    const section = props.target();
    binding = section
      ? attachScrollProgress(section, { onProgress: props.onProgress })
      : undefined;
  });

  onCleanup(() => {
    binding?.cleanup();
    binding = undefined;
    props.onDispose();
  });

  return null;
};

type ScrollLayoutResizeObserver = Pick<ResizeObserver, "observe" | "disconnect">;
type ScrollLayoutResizeObserverConstructor = new (
  callback: ResizeObserverCallback,
) => ScrollLayoutResizeObserver;

const getScrollLayoutResizeObserver =
  (): ScrollLayoutResizeObserverConstructor | undefined => {
    const observerConstructor = (
      window as Window & {
        ResizeObserver?: ScrollLayoutResizeObserverConstructor;
      }
    ).ResizeObserver;
    return typeof observerConstructor === "function"
      ? observerConstructor
      : undefined;
  };

const ScrollHorizontal: Layout<
  typeof componentRecipe,
  ScrollHorizontalProps
> = () => {
  const others = omit(
    local,
    "children",
    "class",
    "dataTheme",
    "style",
    "itemWidth",
    "mobileItemWidth",
    "gap",
    "mobileGap",
    "height",
    "ref",
    "onFocusIn",
    "tabIndex",
    "aria-label",
    "aria-labelledby",
    "role",
  );

  let sectionRef: HTMLElement | undefined;
  let viewportRef: HTMLElement | undefined;
  let trackRef: HTMLDivElement | undefined;
  let prefersReducedMotion = false;

  const [travel, setTravel] = createSignal(0);
  const [measuredHeight, setMeasuredHeight] = createSignal("auto");
  const [ready, setReady] = createSignal(false);
  const [nativeTimeline, setNativeTimeline] = createSignal(false);
  let fallbackProgress = 0;

  const asPixels = (value: number): string =>
    `${Math.max(0, Number.isFinite(value) ? value : 0)}px`;

  const clearFallbackTrackTransform = () => {
    if (!trackRef) return;
    try {
      trackRef.style.removeProperty("transform");
    } catch {
      // The track may already be detached.
    }
  };

  const writeFallbackTrackTransform = (progress?: number) => {
    if (progress !== undefined) fallbackProgress = progress;
    if (!trackRef) return;
    if (prefersReducedMotion || nativeTimeline() || !ready()) {
      clearFallbackTrackTransform();
      return;
    }

    const distance = travel();
    const offset =
      Number.isFinite(distance) && Number.isFinite(fallbackProgress)
        ? -(distance * fallbackProgress)
        : 0;
    try {
      trackRef.style.transform = `translateX(${offset}px)`;
    } catch {
      // Inline transform is the fallback paint path; keep scroll handling.
    }
  };

  const asLength = (value: number | string): string =>
    typeof value === "number" ? asPixels(value) : value;

  const style = createMemo<JSX.CSSProperties>(
    () =>
      ({
        ...(local.style ?? {}),
        "--scroll-horizontal-item-width": asPixels(local.itemWidth ?? 400),
        "--scroll-horizontal-mobile-item-width": asPixels(
          local.mobileItemWidth ?? 280,
        ),
        "--scroll-horizontal-gap": asPixels(local.gap ?? 30),
        "--scroll-horizontal-mobile-gap": asPixels(local.mobileGap ?? 15),
        "--scroll-horizontal-travel": asPixels(travel()),
        "--scroll-horizontal-section-height":
          local.height === undefined || local.height === "auto"
            ? measuredHeight()
            : asLength(local.height),
      }) as JSX.CSSProperties,
  );

  const measure = (): boolean => {
    if (!sectionRef || !viewportRef || !trackRef) return false;

    const rowWidth = trackRef.scrollWidth;
    const viewportWidth = viewportRef.clientWidth;
    const viewportHeight = window.innerHeight;
    if (
      !Number.isFinite(rowWidth) ||
      !Number.isFinite(viewportWidth) ||
      !Number.isFinite(viewportHeight) ||
      viewportWidth <= 0 ||
      viewportHeight <= 0
    ) {
      return false;
    }

    const nextTravel = Math.max(0, rowWidth - viewportWidth);
    const nextHeight =
      local.height === undefined || local.height === "auto"
        ? `${viewportHeight + nextTravel}px`
        : asLength(local.height);

    try {
      sectionRef.style.setProperty(
        "--scroll-horizontal-travel",
        asPixels(nextTravel),
      );
      sectionRef.style.setProperty(
        "--scroll-horizontal-section-height",
        nextHeight,
      );
    } catch {
      return false;
    }

    setTravel((current) => (current === nextTravel ? current : nextTravel));

    if (local.height === undefined || local.height === "auto") {
      setMeasuredHeight((current) =>
        current === nextHeight ? current : nextHeight,
      );
    }

    return true;
  };

  const handleFocusIn: JSX.EventHandlerUnion<HTMLElement, FocusEvent> = (
    event,
  ) => {
    if (
      !prefersReducedMotion &&
      ready() &&
      sectionRef &&
      viewportRef &&
      trackRef &&
      event.target instanceof globalThis.HTMLElement &&
      trackRef.contains(event.target)
    ) {
      const focusTarget = event.target;
      let item: HTMLElement = focusTarget;

      while (item.parentElement && item.parentElement !== trackRef) {
        item = item.parentElement;
      }

      if (item.parentElement === trackRef) {
        const focusRect = focusTarget.getBoundingClientRect();
        const viewportRect = viewportRef.getBoundingClientRect();
        const visibleWidth = viewportRef.clientWidth;
        const itemLeft = focusRect.left - viewportRect.left;
        const itemRight = focusRect.right - viewportRect.left;

        const clipsLeft = itemLeft < 0;
        const clipsRight = itemRight > visibleWidth;

        if (focusRect.width > 0 && (clipsLeft || clipsRight)) {
          const sectionRect = sectionRef.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const sectionRange = Math.max(0, sectionRect.height - viewportHeight);
          const horizontalTravel = travel();

          if (sectionRange > 0 && horizontalTravel > 0) {
            const currentProgress = Math.max(
              0,
              Math.min(1, -sectionRect.top / sectionRange),
            );
            const offsetAtStart = horizontalTravel * currentProgress;
            const itemLeftAtStart = itemLeft + offsetAtStart;
            const itemRightAtStart = itemRight + offsetAtStart;
            const nextProgress = Math.max(
              0,
              Math.min(
                1,
                itemRight <= 0
                  ? itemRightAtStart / horizontalTravel
                  : clipsLeft
                    ? itemLeftAtStart / horizontalTravel
                    : (itemRightAtStart - visibleWidth) / horizontalTravel,
              ),
            );
            const sectionTop = sectionRect.top + window.scrollY;

            window.scrollTo({
              top: sectionTop + nextProgress * sectionRange,
              behavior: "auto",
            });
          }
        }
      }
    }

    if (typeof local.onFocusIn === "function") local.onFocusIn(event);
  };

  onSettled(() => {
    setNativeTimeline(supportsViewTimeline());

    const mediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : undefined;
    const maxInitialRetries = 3;
    let initialRetriesRemaining = maxInitialRetries;
    let active = true;
    let pendingFrame: number | undefined;
    let retryPending = false;
    let layoutObserver: ScrollLayoutResizeObserver | undefined;

    const cancelScheduledMeasure = () => {
      if (pendingFrame !== undefined) {
        window.cancelAnimationFrame(pendingFrame);
        pendingFrame = undefined;
      }
      retryPending = false;
    };

    const scheduleMeasure = (retryIfUnavailable = false) => {
      if (!active || prefersReducedMotion) return;
      retryPending ||= retryIfUnavailable;
      if (pendingFrame !== undefined) return;

      pendingFrame = window.requestAnimationFrame(() => {
        pendingFrame = undefined;
        const shouldRetry = retryPending;
        retryPending = false;
        if (!active || prefersReducedMotion) return;

        const measured = measure();
        setReady(measured);
        writeFallbackTrackTransform();
        if (measured) {
          initialRetriesRemaining = maxInitialRetries;
          return;
        }

        if (shouldRetry && initialRetriesRemaining > 0) {
          initialRetriesRemaining -= 1;
          scheduleMeasure(true);
        }
      });
    };

    const applyMotionPreference = () => {
      prefersReducedMotion = mediaQuery?.matches ?? false;

      if (prefersReducedMotion) {
        cancelScheduledMeasure();
        setReady(false);
        clearFallbackTrackTransform();
        return;
      }

      initialRetriesRemaining = maxInitialRetries;
      scheduleMeasure(true);
    };

    const handleResize = () => {
      if (prefersReducedMotion) return;
      scheduleMeasure();
    };

    window.addEventListener("resize", handleResize, { passive: true });
    mediaQuery?.addEventListener?.("change", applyMotionPreference);
    if (mediaQuery && !mediaQuery.addEventListener) {
      mediaQuery.addListener(applyMotionPreference);
    }

    const ResizeObserverConstructor = getScrollLayoutResizeObserver();
    if (ResizeObserverConstructor && viewportRef && trackRef) {
      try {
        layoutObserver = new ResizeObserverConstructor(handleResize);
        layoutObserver.observe(viewportRef);
        layoutObserver.observe(trackRef);
      } catch {
        layoutObserver?.disconnect();
        layoutObserver = undefined;
      }
    }

    // Bounded frame retries handle late initial layout when ResizeObserver is
    // unavailable; observer notifications cover delayed and later resizes.
    applyMotionPreference();

    return () => {
      active = false;
      cancelScheduledMeasure();
      layoutObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
      mediaQuery?.removeEventListener?.("change", applyMotionPreference);
      if (mediaQuery && !mediaQuery.removeEventListener) {
        mediaQuery.removeListener(applyMotionPreference);
      }
    };
  });

  return (
    <section
      {...others}
      {...slot.root}
      ref={(el) => {
        sectionRef = el;
        if (typeof local.ref === "function") local.ref(el);
      }}
      data-theme={local.dataTheme}
      data-scroll-ready={ready() ? "true" : undefined}
      data-scroll-native={nativeTimeline() ? "true" : undefined}
      style={style()}
      onFocusIn={handleFocusIn}
      role={typeof local.role === "string" ? local.role : "group"}
      aria-label={undefined}
      aria-labelledby={undefined}
    >
      <Show when={ready() && !nativeTimeline()}>
        <ScrollProgressBinding
          target={() => sectionRef}
          onProgress={writeFallbackTrackTransform}
          onDispose={clearFallbackTrackTransform}
        />
      </Show>
      <section
        ref={(el) => {
          viewportRef = el;
        }}
        {...slot.viewport}
        role="region"
        aria-label={
          typeof local["aria-label"] === "string"
            ? local["aria-label"]
            : "Scrollable content"
        }
        aria-labelledby={
          typeof local["aria-labelledby"] === "string"
            ? local["aria-labelledby"]
            : undefined
        }
        tabindex={typeof local.tabIndex === "number" ? local.tabIndex : 0}
      >
        <div
          ref={(el) => {
            trackRef = el;
          }}
          {...slot.track}
        >
          {children}
        </div>
      </section>
    </section>
  );
};

export default ScrollHorizontal;
