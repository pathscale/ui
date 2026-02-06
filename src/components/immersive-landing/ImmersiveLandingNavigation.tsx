import { For, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { ImmersiveLandingNavigationProps } from "./types";

const ImmersiveLandingNavigation = (props: ImmersiveLandingNavigationProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "pages",
    "currentPageIndex",
    "onPageDotClick",
    "onPrev",
    "onNext",
    "isFirstPage",
    "isLastPage",
    "class",
    "className",
    "style",
  ]);

  const mobileArrowClasses = (disabled: boolean) =>
    `md:hidden flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full transition-colors cursor-pointer ${
      disabled
        ? "text-base-content/20 cursor-not-allowed"
        : "text-base-content/70 hover:bg-base-content/10 active:bg-base-content/20"
    }`;

  return (
    <nav
      class={twMerge("fixed left-1/2 -translate-x-1/2 z-50 w-auto px-2", local.class, local.className)}
      aria-label="Page navigation"
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))", ...local.style }}
      {...others}
    >
      <div class="bg-base-100/90 backdrop-blur border border-base-content/10 rounded-full px-2 sm:px-3 py-1.5 sm:py-2 shadow-lg">
        <div class="flex items-center justify-center gap-2 md:gap-3">
          {/* Left arrow - Mobile only */}
          <button
            type="button"
            onClick={local.onPrev}
            disabled={local.isFirstPage}
            class={mobileArrowClasses(local.isFirstPage)}
            aria-label="Previous page"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Page position dots - Desktop only */}
          {local.pages && local.pages.length > 0 && (
            <div class="hidden md:flex items-center gap-1.5 px-2">
              <For each={local.pages}>
                {(pageId, index) => (
                  <button
                    type="button"
                    onClick={() => local.onPageDotClick(pageId)}
                    class={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      index() === local.currentPageIndex
                        ? "bg-primary scale-125"
                        : "bg-base-content/30 hover:bg-base-content/50"
                    }`}
                    aria-label={`Go to page ${index() + 1} of ${local.pages.length}`}
                    aria-current={index() === local.currentPageIndex ? "step" : undefined}
                  />
                )}
              </For>
            </div>
          )}

          {/* Page counter */}
          {local.pages && local.pages.length > 0 && (
            <span class="text-sm text-base-content/60 tabular-nums font-medium min-w-[3ch] text-center">
              {(local.currentPageIndex ?? 0) + 1}/{local.pages.length}
            </span>
          )}

          {/* Right arrow - Mobile only */}
          <button
            type="button"
            onClick={local.onNext}
            disabled={local.isLastPage}
            class={mobileArrowClasses(local.isLastPage)}
            aria-label="Next page"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default ImmersiveLandingNavigation;
