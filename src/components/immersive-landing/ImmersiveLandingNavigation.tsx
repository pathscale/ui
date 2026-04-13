import { For, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { ImmersiveLandingNavigationProps } from "./types";
import { CLASSES } from "./ImmersiveLanding.classes";

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
    twMerge(
      CLASSES.navigation.mobileArrow,
      disabled && CLASSES.navigation.mobileArrowDisabled,
    );

  return (
    <nav
      {...{
        class: twMerge(CLASSES.navigation.base, local.class, local.className),
      }}
      aria-label="Page navigation"
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))", ...local.style }}
      {...others}
    >
      <div {...{ class: CLASSES.navigation.shell }}>
        <div {...{ class: CLASSES.navigation.row }}>
          {/* Left arrow - Mobile only */}
          <button
            type="button"
            onClick={local.onPrev}
            disabled={local.isFirstPage}
            {...{ class: mobileArrowClasses(local.isFirstPage) }}
            aria-label="Previous page"
          >
            <svg
              {...{ class: CLASSES.navigation.icon }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Page position dots - Desktop only */}
          {local.pages && local.pages.length > 0 && (
            <div {...{ class: CLASSES.navigation.dots }}>
              <For each={local.pages}>
                {(pageId, index) => (
                  <button
                    type="button"
                    onClick={() => local.onPageDotClick(pageId)}
                    {...{
                      class: twMerge(
                        CLASSES.navigation.dot,
                        index() === local.currentPageIndex && CLASSES.navigation.dotActive,
                      ),
                    }}
                    aria-label={`Go to page ${index() + 1} of ${local.pages.length}`}
                    aria-current={index() === local.currentPageIndex ? "step" : undefined}
                  />
                )}
              </For>
            </div>
          )}

          {/* Page counter */}
          {local.pages && local.pages.length > 0 && (
            <span {...{ class: CLASSES.navigation.counter }}>
              {(local.currentPageIndex ?? 0) + 1}/{local.pages.length}
            </span>
          )}

          {/* Right arrow - Mobile only */}
          <button
            type="button"
            onClick={local.onNext}
            disabled={local.isLastPage}
            {...{ class: mobileArrowClasses(local.isLastPage) }}
            aria-label="Next page"
          >
            <svg
              {...{ class: CLASSES.navigation.icon }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default ImmersiveLandingNavigation;
