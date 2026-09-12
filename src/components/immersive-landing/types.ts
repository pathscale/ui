import type { JSX } from "@solidjs/web";
import type { Accessor } from "solid-js";
import type { UIBaseProps } from "../vocabulary";

export interface UseImmersiveLandingOptions {
  pages: readonly string[];
  initialPage?: string;
  currentPage?: Accessor<string>;
  transitionDuration?: number;
  onNavigate?: (fromPage: string, toPage: string) => void;
  onNavigationComplete?: (page: string) => void;
  enableScrollNavigation?: boolean;
}

export interface UseImmersiveLandingReturn {
  activePage: Accessor<string>;
  isTransitioning: Accessor<boolean>;
  navigateTo: (pageId: string) => void;
  goNext: () => void;
  goPrev: () => void;
  currentIndex: Accessor<number>;
  isFirstPage: Accessor<boolean>;
  isLastPage: Accessor<boolean>;
  direction: Accessor<"next" | "prev" | null>;
  transitionDuration: number;
}

export interface ImmersiveLandingContextValue {
  activePage: Accessor<string>;
  navigateTo: (pageId: string) => void;
  goNext: () => void;
  goPrev: () => void;
  currentIndex: Accessor<number>;
  totalPages: number;
  isFirstPage: Accessor<boolean>;
  isLastPage: Accessor<boolean>;
  direction: Accessor<"next" | "prev" | null>;
  transitionDuration: number;
  pages: readonly string[];
  appVersion?: string;
}

export interface ImmersiveLandingProps extends UIBaseProps {
  pages: readonly string[];
  initialPage?: string;
  currentPage?: Accessor<string>;
  transitionDuration?: number;
  onNavigate?: (fromPage: string, toPage: string) => void;
  onNavigationComplete?: (page: string) => void;
  enableScrollNavigation?: boolean;
  showNavigation?: boolean;
  showArrows?: boolean;
  appVersion?: string;
  overlay?:
    | JSX.Element
    | ((context: ImmersiveLandingContextValue) => JSX.Element);
  children:
    | JSX.Element
    | ((context: ImmersiveLandingContextValue) => JSX.Element);
  pwaConfig?: PWAInstallPromptProps;
  cookieConfig?: CookieConsentProps;
  firefoxPWAConfig?: FirefoxPWABannerProps;
  showPWAPrompt?: boolean;
  showCookieConsent?: boolean;
  showFirefoxBanner?: boolean;
}

export interface ImmersiveLandingPageProps extends UIBaseProps {
  id: string;
  children: JSX.Element;
}

export interface ImmersiveLandingArrowsProps extends UIBaseProps {
  onPrev: () => void;
  onNext: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export interface ImmersiveLandingNavigationProps extends UIBaseProps {
  pages: readonly string[];
  currentPageIndex: number;
  onPageDotClick: (pageId: string) => void;
  onPrev: () => void;
  onNext: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export type ConsentType = "all" | "essential" | "custom";

export interface CookieConsentTexts {
  message?: string;
  acceptAll?: string;
  decline?: string;
  manage?: string;

  manageTitle?: string;

  essential?: string;
  analytics?: string;
  marketing?: string;

  cancel?: string;
  save?: string;

  closeLabel?: string;
}

export interface CookieConsentStorageKeys {
  consentKey?: string;
  analyticsKey?: string;
  marketingKey?: string;
}

export interface CookieConsentProps {
  /** Caller-owned base used to derive stable IDs for every consent control. */
  id?: string;
  texts?: CookieConsentTexts;
  storageKeys?: CookieConsentStorageKeys;

  onConsentChange?: (payload: {
    type: ConsentType;
    analytics: boolean;
    marketing: boolean;
  }) => void;
}

export type BrowserType = "firefox" | "safari" | "other" | "supported";

export interface FirefoxPWABannerTexts {
  title?: string;
  description?: string;
  installButton?: string;
  dismissButton?: string;
  closeLabel?: string;
}

export interface FirefoxPWABannerProps {
  /** Caller-owned base used to derive stable IDs for every banner control. */
  id?: string;
  extensionUrl?: string;
  storageKey?: string;
  /** Delay before the banner appears. Defaults to 2000ms. */
  showDelayMs?: number;
  texts?: FirefoxPWABannerTexts;
  /**
   * The browser mark shown beside the text. Omit it and the banner renders
   * without one.
   *
   * A default lived here as `icon-[mdi--firefox]`, and it was the only reason
   * this library needed a second Iconify set. Everything else it draws is
   * `lucide`, which has no brand glyphs, so one banner in one optional
   * component obliged every consumer to install all of `-json/mdi` --
   * and a consumer who installed only `lucide` got build warnings and a blank
   * space, which is what happened on crates.vip.
   *
   * Accepts what `Icon` accepts: an Iconify class such as
   * `"icon-[mdi--firefox]"`, or an inline SVG element.
   */
  icon?: string | JSX.Element;
  onInstall?: () => void;
  onDismiss?: () => void;
}

export interface PWAInstallPromptTexts {
  title?: string;
  description?: string;
  installButton?: string;
  notNowButton?: string;
  closeLabel?: string;
}

export interface PWAInstallPromptProps {
  /** Caller-owned base used to derive stable IDs for every prompt control. */
  id?: string;
  appName?: string;
  appIcon?: string;
  storageKey?: string;
  texts?: PWAInstallPromptTexts;
  onInstall?: () => void;
  onDismiss?: () => void;
}
