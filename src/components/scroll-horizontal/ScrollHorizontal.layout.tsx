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
  createScrollProgress,
  supportsViewTimeline,
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
}> = (props) => {
  createScrollProgress(props.target, { range: "start-start/end-end" });
  return null;
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

  const asPixels = (value: number): string =>
    `${Math.max(0, Number.isFinite(value) ? value : 0)}px`;

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

        if (
          focusRect.width > 0 &&
          (itemRight <= 0 || itemLeft >= visibleWidth)
        ) {
          const sectionRect = sectionRef.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const sectionRange = Math.max(0, sectionRect.height - viewportHeight);
          const horizontalTravel = travel();

          if (sectionRange > 0 && horizontalTravel > 0) {
            const currentProgress = Math.max(
              0,
              Math.min(1, (viewportHeight - sectionRect.top) / sectionRange),
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
                  : (itemLeftAtStart - visibleWidth) / horizontalTravel,
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
    const applyMotionPreference = () => {
      prefersReducedMotion = mediaQuery?.matches ?? false;

      if (prefersReducedMotion) {
        setReady(false);
        return;
      }

      setReady(measure());
    };

    const handleResize = () => {
      if (prefersReducedMotion) return;
      setReady(measure());
    };

    applyMotionPreference();

    window.addEventListener("resize", handleResize, { passive: true });
    mediaQuery?.addEventListener?.("change", applyMotionPreference);
    if (mediaQuery && !mediaQuery.addEventListener) {
      mediaQuery.addListener(applyMotionPreference);
    }

    onCleanup(() => {
      window.removeEventListener("resize", handleResize);
      mediaQuery?.removeEventListener?.("change", applyMotionPreference);
      if (mediaQuery && !mediaQuery.removeEventListener) {
        mediaQuery.removeListener(applyMotionPreference);
      }
    });
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
      style={style()}
      onFocusIn={handleFocusIn}
    >
      <Show when={ready() && !nativeTimeline()}>
        <ScrollProgressBinding target={() => sectionRef} />
      </Show>
      <section
        ref={(el) => {
          viewportRef = el;
        }}
        {...slot.viewport}
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
