import { createEffect, onCleanup, type Accessor } from "solid-js";
import type {
  ScrollShadowOrientation,
  ScrollShadowVisibility,
} from "./ScrollShadow";

export interface UseScrollShadowProps {
  containerRef: Accessor<HTMLElement | undefined>;
  orientation: Accessor<ScrollShadowOrientation>;
  offset: Accessor<number>;
  visibility: Accessor<ScrollShadowVisibility>;
  isEnabled: Accessor<boolean>;
  onVisibilityChange?: Accessor<
    ((visibility: ScrollShadowVisibility) => void) | undefined
  >;
}

type OverflowState = {
  hasScrollBefore: boolean;
  hasScrollAfter: boolean;
};

export const clearScrollShadowDataAttributes = (el: HTMLElement): void => {
  delete el.dataset.topScroll;
  delete el.dataset.bottomScroll;
  delete el.dataset.topBottomScroll;
  delete el.dataset.leftScroll;
  delete el.dataset.rightScroll;
  delete el.dataset.leftRightScroll;
};

export const applyControlledScrollShadowVisibility = (
  el: HTMLElement,
  visibility: ScrollShadowVisibility,
  orientation: ScrollShadowOrientation,
): void => {
  clearScrollShadowDataAttributes(el);

  if (visibility === "both") {
    if (orientation === "vertical") {
      el.dataset.topBottomScroll = "true";
    } else {
      el.dataset.leftRightScroll = "true";
    }
    return;
  }

  if (visibility === "none" || visibility === "auto") return;

  if (visibility === "top") {
    el.dataset.topScroll = "true";
  } else if (visibility === "bottom") {
    el.dataset.bottomScroll = "true";
  } else if (visibility === "left") {
    el.dataset.leftScroll = "true";
  } else if (visibility === "right") {
    el.dataset.rightScroll = "true";
  }
};

const resolveVisibilityFromOverflow = (
  orientation: ScrollShadowOrientation,
  hasScrollBefore: boolean,
  hasScrollAfter: boolean,
): ScrollShadowVisibility => {
  if (hasScrollBefore && hasScrollAfter) return "both";
  if (hasScrollBefore) return orientation === "vertical" ? "top" : "left";
  if (hasScrollAfter) return orientation === "vertical" ? "bottom" : "right";
  return "none";
};

const applyAutoVisibilityDataAttributes = (
  el: HTMLElement,
  orientation: ScrollShadowOrientation,
  hasScrollBefore: boolean,
  hasScrollAfter: boolean,
): void => {
  if (orientation === "vertical") {
    if (hasScrollBefore && hasScrollAfter) {
      el.dataset.topBottomScroll = "true";
      delete el.dataset.topScroll;
      delete el.dataset.bottomScroll;
      return;
    }

    el.dataset.topScroll = String(hasScrollBefore);
    el.dataset.bottomScroll = String(hasScrollAfter);
    delete el.dataset.topBottomScroll;
    return;
  }

  if (hasScrollBefore && hasScrollAfter) {
    el.dataset.leftRightScroll = "true";
    delete el.dataset.leftScroll;
    delete el.dataset.rightScroll;
    return;
  }

  el.dataset.leftScroll = String(hasScrollBefore);
  el.dataset.rightScroll = String(hasScrollAfter);
  delete el.dataset.leftRightScroll;
};

export const useScrollShadow = (props: UseScrollShadowProps): void => {
  createEffect(() => {
    const el = props.containerRef();
    const isEnabled = props.isEnabled();
    const visibility = props.visibility();
    const orientation = props.orientation();
    const offset = props.offset();
    const onVisibilityChange = props.onVisibilityChange?.();

    if (!el) return;

    if (!isEnabled) {
      clearScrollShadowDataAttributes(el);
      return;
    }

    if (visibility !== "auto") return;

    let prevState: OverflowState | null = null;
    let rafId: number | null = null;

    const checkOverflow = () => {
      const scrollStart =
        orientation === "vertical" ? el.scrollTop : el.scrollLeft;
      const scrollSize =
        orientation === "vertical" ? el.scrollHeight : el.scrollWidth;
      const clientSize =
        orientation === "vertical" ? el.clientHeight : el.clientWidth;

      const hasScrollBefore = scrollStart > offset;
      const hasScrollAfter = scrollStart + clientSize + offset < scrollSize;

      if (
        prevState &&
        prevState.hasScrollBefore === hasScrollBefore &&
        prevState.hasScrollAfter === hasScrollAfter
      ) {
        return;
      }

      prevState = { hasScrollBefore, hasScrollAfter };

      if (rafId !== null) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        rafId = null;
        applyAutoVisibilityDataAttributes(
          el,
          orientation,
          hasScrollBefore,
          hasScrollAfter,
        );
        onVisibilityChange?.(
          resolveVisibilityFromOverflow(
            orientation,
            hasScrollBefore,
            hasScrollAfter,
          ),
        );
      });
    };

    checkOverflow();
    el.addEventListener("scroll", checkOverflow, { passive: true });

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => checkOverflow())
        : undefined;

    resizeObserver?.observe(el);

    onCleanup(() => {
      el.removeEventListener("scroll", checkOverflow);
      resizeObserver?.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
      prevState = null;
    });
  });
};

