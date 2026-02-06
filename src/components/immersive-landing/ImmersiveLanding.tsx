import { Show, splitProps, type Component } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { ImmersiveLandingProps, ImmersiveLandingContextValue } from "./types";
import { useImmersiveLanding } from "./useImmersiveLanding";
import { ImmersiveLandingContext } from "./ImmersiveLandingContext";
import ImmersiveLandingPage from "./ImmersiveLandingPage";
import ImmersiveLandingArrows from "./ImmersiveLandingArrows";
import ImmersiveLandingNavigation from "./ImmersiveLandingNavigation";

const ImmersiveLanding: Component<ImmersiveLandingProps> = (props) => {
  // Don't split children - access directly from props to preserve reactivity
  const [local, others] = splitProps(props, [
    "pages",
    "initialPage",
    "transitionDuration",
    "onNavigate",
    "onNavigationComplete",
    "enableScrollNavigation",
    "showNavigation",
    "showArrows",
    "appVersion",
    "children",
    "class",
    "className",
    "style",
  ]);

  const navigation = useImmersiveLanding({
    pages: local.pages,
    initialPage: local.initialPage,
    transitionDuration: local.transitionDuration,
    onNavigate: local.onNavigate,
    onNavigationComplete: local.onNavigationComplete,
    enableScrollNavigation: local.enableScrollNavigation,
  });

  // Create context value - pass signal getters directly
  const contextValue: ImmersiveLandingContextValue = {
    activePage: navigation.activePage,
    navigateTo: navigation.navigateTo,
    goNext: navigation.goNext,
    goPrev: navigation.goPrev,
    currentIndex: navigation.currentIndex,
    totalPages: local.pages.length,
    isFirstPage: navigation.isFirstPage,
    isLastPage: navigation.isLastPage,
    direction: navigation.direction,
    transitionDuration: navigation.transitionDuration,
    pages: local.pages,
    appVersion: local.appVersion,
  };

  const showNav = () => local.showNavigation !== false;
  const showArrowNav = () => local.showArrows !== false;

  const classes = () =>
    twMerge(
      "fixed inset-0 h-screen w-screen overflow-hidden bg-transparent relative isolate",
      local.class,
      local.className,
    );

  // Render children - if it's a function, call it with context for render props pattern
  const renderChildren = () => {
    return typeof local.children === "function"
      ? local.children(contextValue)
      : local.children;
  };

  return (
    <ImmersiveLandingContext.Provider value={contextValue}>
      {/* Fixed viewport */}
      <div class={classes()} style={local.style} {...others}>
        {/* Layered container for fade transitions */}
        <div class="relative h-full w-full">
          <div class="relative z-10 h-full w-full">{renderChildren()}</div>
          <Show when={local.appVersion}>
            <div class="pointer-events-none absolute inset-0 z-20 flex items-end justify-end p-6" aria-hidden="true">
              <span class="font-mono text-base-content/20 text-[clamp(0.75rem,2vw,1.25rem)] tracking-[0.4em]">
                v{local.appVersion}
              </span>
            </div>
          </Show>
        </div>
      </div>

      {/* Desktop side arrows */}
      {showArrowNav() && (
        <ImmersiveLandingArrows
          onPrev={navigation.goPrev}
          onNext={navigation.goNext}
          isFirstPage={navigation.isFirstPage()}
          isLastPage={navigation.isLastPage()}
        />
      )}

      {/* Bottom navigation (dots, counter, mobile arrows) */}
      {showNav() && (
        <ImmersiveLandingNavigation
          pages={local.pages}
          currentPageIndex={navigation.currentIndex()}
          onPageDotClick={navigation.navigateTo}
          onPrev={navigation.goPrev}
          onNext={navigation.goNext}
          isFirstPage={navigation.isFirstPage()}
          isLastPage={navigation.isLastPage()}
        />
      )}
    </ImmersiveLandingContext.Provider>
  );
};

export default Object.assign(ImmersiveLanding, {
  Page: ImmersiveLandingPage,
  Arrows: ImmersiveLandingArrows,
  Navigation: ImmersiveLandingNavigation,
});
