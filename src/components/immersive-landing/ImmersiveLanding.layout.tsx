import "./ImmersiveLanding.css";
import { type Component, omit, Show } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import { CookieConsent } from "./components/CookieConsent";
import { FirefoxPWABanner } from "./components/FirefoxPWABanner";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { CLASSES, type componentRecipe } from "./ImmersiveLanding.recipe";
import ImmersiveLandingArrows from "./ImmersiveLandingArrows.generated";
import { ImmersiveLandingContext } from "./ImmersiveLandingContext";
import ImmersiveLandingNavigation from "./ImmersiveLandingNavigation.generated";
import ImmersiveLandingPage from "./ImmersiveLandingPage.generated";
import type {
  ImmersiveLandingContextValue,
  ImmersiveLandingProps,
} from "./types";
import { useImmersiveLanding } from "./useImmersiveLanding";

const ImmersiveLanding: Layout<
  typeof componentRecipe,
  ImmersiveLandingProps
> = () => {
  // Don't split children - access directly from props to preserve reactivity
  const others = omit(
    props,
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
    "style",
    "pwaConfig",
    "cookieConfig",
    "firefoxPWAConfig",
    "showPWAPrompt",
    "showCookieConsent",
    "showFirefoxBanner",
  );

  const navigation = useImmersiveLanding({
    pages: props.pages,
    initialPage: props.initialPage,
    currentPage: props.currentPage,
    transitionDuration: props.transitionDuration,
    onNavigate: props.onNavigate,
    onNavigationComplete: props.onNavigationComplete,
    enableScrollNavigation: props.enableScrollNavigation,
  });

  // Create context value - pass signal getters directly
  const contextValue: ImmersiveLandingContextValue = {
    activePage: navigation.activePage,
    navigateTo: navigation.navigateTo,
    goNext: navigation.goNext,
    goPrev: navigation.goPrev,
    currentIndex: navigation.currentIndex,
    totalPages: props.pages.length,
    isFirstPage: navigation.isFirstPage,
    isLastPage: navigation.isLastPage,
    direction: navigation.direction,
    transitionDuration: navigation.transitionDuration,
    pages: props.pages,
    appVersion: props.appVersion,
  };

  const showNav = () => props.showNavigation !== false;
  const showArrowNav = () => props.showArrows !== false;

  const classes = () => twMerge(CLASSES.landing.base, props.class);

  // Render children - if it's a function, call it with context for render props pattern
  const renderChildren = () => {
    return typeof props.children === "function"
      ? props.children(contextValue)
      : props.children;
  };

  const renderOverlay = () => {
    return typeof props.overlay === "function"
      ? props.overlay(contextValue)
      : props.overlay;
  };

  return (
    <ImmersiveLandingContext value={contextValue}>
      {/* Fixed viewport */}
      <div
        {...{ class: classes() }}
        style={props.style}
        {...others}
      >
        {/* Layered container for fade transitions */}
        <div {...{ class: CLASSES.landing.viewport }}>
          <div {...{ class: CLASSES.landing.pageLayer }}>
            {renderChildren()}
          </div>
        </div>
      </div>

      <Show when={props.overlay || props.appVersion}>
        <div {...{ class: CLASSES.landing.overlay }}>
          {renderOverlay()}
          <Show when={props.appVersion}>
            <div
              {...{ class: CLASSES.landing.versionWrap }}
              aria-hidden="true"
            >
              <span {...{ class: CLASSES.landing.versionLabel }}>
                v{props.appVersion}
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
          pages={props.pages}
          currentPageIndex={navigation.currentIndex()}
          onPageDotClick={navigation.navigateTo}
          onPrev={navigation.goPrev}
          onNext={navigation.goNext}
          isFirstPage={navigation.isFirstPage()}
          isLastPage={navigation.isLastPage()}
        />
      )}

      <Show when={props.showPWAPrompt}>
        <PWAInstallPrompt
          appName={props.pwaConfig?.appName}
          appIcon={props.pwaConfig?.appIcon}
          storageKey={props.pwaConfig?.storageKey ?? "app_pwa_dismissed"}
          texts={props.pwaConfig?.texts}
          onInstall={props.pwaConfig?.onInstall}
          onDismiss={props.pwaConfig?.onDismiss}
        />
      </Show>
      <Show when={props.showFirefoxBanner}>
        <FirefoxPWABanner
          extensionUrl={props.firefoxPWAConfig?.extensionUrl}
          storageKey={
            props.firefoxPWAConfig?.storageKey ?? "app_firefox_pwa_dismissed"
          }
          texts={props.firefoxPWAConfig?.texts}
          onInstall={props.firefoxPWAConfig?.onInstall}
          onDismiss={props.firefoxPWAConfig?.onDismiss}
        />
      </Show>
      <Show when={props.showCookieConsent}>
        <CookieConsent
          storageKeys={props.cookieConfig?.storageKeys}
          texts={props.cookieConfig?.texts}
          onConsentChange={props.cookieConfig?.onConsentChange}
        />
      </Show>
    </ImmersiveLandingContext>
  );
};

export default Object.assign(ImmersiveLanding, {
  Page: ImmersiveLandingPage,
  Arrows: ImmersiveLandingArrows,
  Navigation: ImmersiveLandingNavigation,
});
