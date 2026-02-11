import { Show, splitProps, type Component } from "solid-js";
import { twMerge } from "tailwind-merge";
import type {
  ImmersiveLandingProps,
  ImmersiveLandingContextValue,
} from "./types";
import { useImmersiveLanding } from "./useImmersiveLanding";
import { ImmersiveLandingContext } from "./ImmersiveLandingContext";
import ImmersiveLandingPage from "./ImmersiveLandingPage";
import ImmersiveLandingArrows from "./ImmersiveLandingArrows";
import ImmersiveLandingNavigation from "./ImmersiveLandingNavigation";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { FirefoxPWABanner } from "./components/FirefoxPWABanner";
import { CookieConsent } from "./components/CookieConsent";

const ImmersiveLanding: Component<ImmersiveLandingProps> = (props) => {
  // Don't split children - access directly from props to preserve reactivity
  const [local, others] = splitProps(props, [
    "pages",
    "initialPage",
    "currentPage",
    "transitionDuration",
    "onNavigate",
    "onNavigationComplete",
    "enableScrollNavigation",
    "showNavigation",
    "showArrows",
    "appVersion",
    "overlay",
    "children",
    "class",
    "className",
    "style",
    "pwaConfig",
    "cookieConfig",
    "firefoxPWAConfig",
    "showPWAPrompt",
    "showCookieConsent",
    "showFirefoxBanner",
  ]);

  const navigation = useImmersiveLanding({
    pages: local.pages,
    initialPage: local.initialPage,
    currentPage: local.currentPage,
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

  const renderOverlay = () => {
    return typeof local.overlay === "function"
      ? local.overlay(contextValue)
      : local.overlay;
  };

  return (
    <ImmersiveLandingContext.Provider value={contextValue}>
      {/* Fixed viewport */}
      <div class={classes()} style={local.style} {...others}>
        {/* Layered container for fade transitions */}
        <div class="relative h-full w-full">
          <div class="relative z-10 h-full w-full">{renderChildren()}</div>
        </div>
      </div>

      <Show when={local.overlay || local.appVersion}>
        <div class="pointer-events-none fixed inset-0 z-30">
          {renderOverlay()}
          <Show when={local.appVersion}>
            <div class="absolute bottom-20 right-6" aria-hidden="true">
              <span class="font-mono text-base-content/20 text-[clamp(0.75rem,2vw,1.25rem)] tracking-[0.4em]">
                v{local.appVersion}
              </span>
            </div>
          </Show>
        </div>
      </Show>

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

      <Show when={local.showPWAPrompt !== false}>
        <PWAInstallPrompt
          appName={local.pwaConfig?.appName}
          appIcon={local.pwaConfig?.appIcon}
          storageKey={local.pwaConfig?.storageKey ?? "app_pwa_dismissed"}
          texts={local.pwaConfig?.texts}
          onInstall={local.pwaConfig?.onInstall}
          onDismiss={local.pwaConfig?.onDismiss}
        />
      </Show>
      <Show when={local.showFirefoxBanner !== false}>
        <FirefoxPWABanner
          extensionUrl={local.firefoxPWAConfig?.extensionUrl}
          storageKey={
            local.firefoxPWAConfig?.storageKey ?? "app_firefox_pwa_dismissed"
          }
          texts={local.firefoxPWAConfig?.texts}
          onInstall={local.firefoxPWAConfig?.onInstall}
          onDismiss={local.firefoxPWAConfig?.onDismiss}
        />
      </Show>
      <Show when={local.showCookieConsent !== false}>
        <CookieConsent
          storageKeys={local.cookieConfig?.storageKeys}
          texts={local.cookieConfig?.texts}
          onConsentChange={local.cookieConfig?.onConsentChange}
        />
      </Show>
    </ImmersiveLandingContext.Provider>
  );
};

export default Object.assign(ImmersiveLanding, {
  Page: ImmersiveLandingPage,
  Arrows: ImmersiveLandingArrows,
  Navigation: ImmersiveLandingNavigation,
});
