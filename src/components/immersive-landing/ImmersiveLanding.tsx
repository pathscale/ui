import "./ImmersiveLanding.css";
import { Show, splitProps, type Component } from "solid-js";
import { twMerge } from "tailwind-merge";
import type {
  ImmersiveLandingProps,
  ImmersiveLandingContextValue,
} from "./types";
import { CLASSES } from "./ImmersiveLanding.classes";
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
      CLASSES.landing.base,
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
      <div {...{ class: classes() }} style={local.style} {...others}>
        {/* Layered container for fade transitions */}
        <div {...{ class: CLASSES.landing.viewport }}>
          <div {...{ class: CLASSES.landing.pageLayer }}>{renderChildren()}</div>
        </div>
      </div>

      <Show when={local.overlay || local.appVersion}>
        <div {...{ class: CLASSES.landing.overlay }}>
          {renderOverlay()}
          <Show when={local.appVersion}>
            <div {...{ class: CLASSES.landing.versionWrap }} aria-hidden="true">
              <span {...{ class: CLASSES.landing.versionLabel }}>
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

      <Show when={local.showPWAPrompt}>
        <PWAInstallPrompt
          appName={local.pwaConfig?.appName}
          appIcon={local.pwaConfig?.appIcon}
          storageKey={local.pwaConfig?.storageKey ?? "app_pwa_dismissed"}
          texts={local.pwaConfig?.texts}
          onInstall={local.pwaConfig?.onInstall}
          onDismiss={local.pwaConfig?.onDismiss}
        />
      </Show>
      <Show when={local.showFirefoxBanner}>
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
      <Show when={local.showCookieConsent}>
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
