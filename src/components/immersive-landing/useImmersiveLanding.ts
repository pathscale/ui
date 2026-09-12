import {
  createSignal,
  createTrackedEffect,
  onCleanup,
  onSettled,
} from "solid-js";
import type {
  UseImmersiveLandingOptions,
  UseImmersiveLandingReturn,
} from "./types";

export function useImmersiveLanding(
  options: UseImmersiveLandingOptions,
): UseImmersiveLandingReturn {
  const {
    pages,
    initialPage = pages[0],
    currentPage: controlledPage,
    transitionDuration = 400,
    onNavigate,
    onNavigationComplete,
    enableScrollNavigation = true,
  } = options;

  const isControlled = !!controlledPage;
  const [internalPage, setInternalPage] = createSignal(initialPage);
  const [isTransitioning, setIsTransitioning] = createSignal(false);
  const [direction, setDirection] = createSignal<"next" | "prev" | null>(null);
  let pendingPage: string | undefined;
  let expectedControlledPage: string | undefined;
  let transitionTimer: ReturnType<typeof setTimeout> | undefined;

  const activePage = controlledPage ?? internalPage;
  const currentIndex = () => pages.indexOf(activePage());
  const isFirstPage = () => currentIndex() === 0;
  const isLastPage = () => currentIndex() === pages.length - 1;

  const completeTransition = (pageId: string) => {
    transitionTimer = undefined;
    setIsTransitioning(false);
    setDirection(null);

    if (expectedControlledPage === pageId && activePage() !== pageId) {
      expectedControlledPage = undefined;
    }

    const pageElement = document.getElementById(pageId);
    if (pageElement) {
      pageElement.focus({ preventScroll: true });
    }

    onNavigationComplete?.(pageId);

    const nextPage = pendingPage;
    pendingPage = undefined;
    if (nextPage && nextPage !== activePage()) {
      queueMicrotask(() => navigateToInternal(nextPage));
    }
  };

  const beginTransition = (
    fromPage: string,
    pageId: string,
    notifyNavigation: boolean,
  ) => {
    const fromIndex = pages.indexOf(fromPage);
    const toIndex = pages.indexOf(pageId);

    setDirection(toIndex > fromIndex ? "next" : "prev");
    setIsTransitioning(true);
    if (!isControlled) setInternalPage(pageId);

    if (notifyNavigation) {
      if (isControlled) expectedControlledPage = pageId;
      onNavigate?.(fromPage, pageId);
    }

    transitionTimer = setTimeout(
      () => completeTransition(pageId),
      transitionDuration,
    );
  };

  function navigateToInternal(pageId: string) {
    if (!pages.includes(pageId)) return;
    if (isTransitioning()) {
      pendingPage = pageId === activePage() ? undefined : pageId;
      return;
    }
    if (pageId === activePage()) return;

    beginTransition(activePage(), pageId, true);
  }

  // Route changes initiated by `onNavigate` already own their transition.
  // Animate only genuinely external changes such as browser back/forward.
  if (controlledPage) {
    let previousPage = controlledPage();
    createTrackedEffect(() => {
      const nextPage = controlledPage();
      if (nextPage === previousPage) return;

      const fromPage = previousPage;
      previousPage = nextPage;

      if (nextPage === expectedControlledPage) {
        expectedControlledPage = undefined;
        return;
      }
      if (!pages.includes(nextPage)) return;
      if (isTransitioning()) {
        pendingPage = nextPage;
        return;
      }

      beginTransition(fromPage, nextPage, false);
    });
  }

  const navigateTo = (pageId: string) => navigateToInternal(pageId);

  const goNext = () => {
    const idx = currentIndex();
    if (idx < pages.length - 1) {
      navigateToInternal(pages[idx + 1]);
    }
  };

  const goPrev = () => {
    const idx = currentIndex();
    if (idx > 0) {
      navigateToInternal(pages[idx - 1]);
    }
  };

  onSettled(() => {
    if (typeof window === "undefined") return;
    if (!enableScrollNavigation) return;

    // Cooldown to prevent rapid navigation
    let scrollLocked = false;
    const SCROLL_COOLDOWN = 1000; // 1 second cooldown between scroll navigations

    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      if (scrollLocked || isTransitioning()) return;

      // Determine scroll direction and navigate
      if (e.deltaY > 0) {
        goNext();
      } else if (e.deltaY < 0) {
        goPrev();
      }

      // Lock scrolling for cooldown period
      scrollLocked = true;
      setTimeout(() => {
        scrollLocked = false;
      }, SCROLL_COOLDOWN);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (scrollLocked || isTransitioning()) return;

      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - touchEndY;

      // Minimum swipe distance threshold
      if (Math.abs(deltaY) < 50) return;

      if (deltaY > 0) {
        goNext();
      } else {
        goPrev();
      }

      // Lock scrolling for cooldown period
      scrollLocked = true;
      setTimeout(() => {
        scrollLocked = false;
      }, SCROLL_COOLDOWN);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning()) return;

      // Don't capture if user is in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
          e.preventDefault();
          goNext();
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          goPrev();
          break;
        case " ": // Space - only if not focused on button
          if (target.tagName !== "BUTTON" && target.tagName !== "A") {
            e.preventDefault();
            goNext();
          }
          break;
        case "Home":
          e.preventDefault();
          navigateToInternal(pages[0]);
          break;
        case "End":
          e.preventDefault();
          navigateToInternal(pages[pages.length - 1]);
          break;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  onCleanup(() => {
    if (transitionTimer !== undefined) clearTimeout(transitionTimer);
  });

  return {
    activePage,
    isTransitioning,
    navigateTo,
    goNext,
    goPrev,
    currentIndex,
    isFirstPage,
    isLastPage,
    direction,
    transitionDuration,
  };
}
