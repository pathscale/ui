import {For, omit} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";
import type { ImmersiveLandingNavigationProps } from "./types";
import { CLASSES } from "./ImmersiveLanding.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ImmersiveLanding.recipe";

const ImmersiveLandingNavigation: Layout<typeof componentRecipe, ImmersiveLandingNavigationProps> = () => {
  const others = omit(
    props,
    "pages",
    "currentPageIndex",
    "onPageDotClick",
    "onPrev",
    "onNext",
    "isFirstPage",
    "isLastPage",
    "class",
    "style",
  );

  const mobileArrowClasses = (disabled: boolean) =>
    twMerge(
      CLASSES.navigation.mobileArrow,
      disabled && CLASSES.navigation.mobileArrowDisabled,
    );

  return (
    <nav
      {...{
        class: twMerge(CLASSES.navigation.base, props.class),
      }}
      aria-label="Page navigation"
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))", ...props.style }}
      {...others}
    >
      <div {...{ class: CLASSES.navigation.shell }}>
        <div {...{ class: CLASSES.navigation.row }}>
          {/* Left arrow - Mobile only */}
          <button
            type="button"
            onClick={props.onPrev}
            disabled={props.isFirstPage}
            {...{ class: mobileArrowClasses(props.isFirstPage) }}
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
          {props.pages && props.pages.length > 0 && (
            <div {...{ class: CLASSES.navigation.dots }}>
              <For each={props.pages}>
                {(pageId, index) => (
                  <button
                    type="button"
                    onClick={() => props.onPageDotClick(pageId)}
                    {...{
                      class: twMerge(
                        CLASSES.navigation.dot,
                        index() === props.currentPageIndex && CLASSES.navigation.dotActive,
                      ),
                    }}
                    aria-label={`Go to page ${index() + 1} of ${props.pages.length}`}
                    aria-current={index() === props.currentPageIndex ? "step" : undefined}
                  />
                )}
              </For>
            </div>
          )}

          {/* Page counter */}
          {props.pages && props.pages.length > 0 && (
            <span {...{ class: CLASSES.navigation.counter }}>
              {(props.currentPageIndex ?? 0) + 1}/{props.pages.length}
            </span>
          )}

          {/* Right arrow - Mobile only */}
          <button
            type="button"
            onClick={props.onNext}
            disabled={props.isLastPage}
            {...{ class: mobileArrowClasses(props.isLastPage) }}
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
