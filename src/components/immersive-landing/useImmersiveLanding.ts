import { createSignal, onMount, onCleanup } from "solid-js";
import type { UseImmersiveLandingOptions, UseImmersiveLandingReturn } from "./types";

export function useImmersiveLanding(options: UseImmersiveLandingOptions): UseImmersiveLandingReturn {
  const {
    pages,
    initialPage = pages[0],
    transitionDuration = 400,
    onNavigate,
    onNavigationComplete,
    enableScrollNavigation = true,
  } = options;

  const [activePage, setActivePage] = createSignal(initialPage);
  const [isTransitioning, setIsTransitioning] = createSignal(false);
  const [direction, setDirection] = createSignal<"next" | "prev" | null>(null);

  const currentIndex = () => pages.indexOf(activePage());
  const isFirstPage = () => currentIndex() === 0;
  const isLastPage = () => currentIndex() === pages.length - 1;

  const navigateToInternal = (pageId: string) => {
    if (isTransitioning() || !pages.includes(pageId)) return;
    if (pageId === activePage()) return;

    const fromPage = activePage();
    const fromIndex = pages.indexOf(fromPage);
    const toIndex = pages.indexOf(pageId);

    setDirection(toIndex > fromIndex ? "next" : "prev");
    setIsTransitioning(true);
    setActivePage(pageId);

    if (onNavigate) onNavigate(fromPage, pageId);

    setTimeout(() => {
      setIsTransitioning(false);
      setDirection(null);

      // Focus management for accessibility
      const pageElement = document.getElementById(pageId);
      if (pageElement) {
        pageElement.focus({ preventScroll: true });
      }

      if (onNavigationComplete) onNavigationComplete(pageId);
    }, transitionDuration);
  };

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

  onMount(() => {
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
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
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

    onCleanup(() => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    });
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
