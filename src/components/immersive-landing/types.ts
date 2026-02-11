import type { JSX, Accessor } from "solid-js";
import type { IComponentBaseProps } from "../types";

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

export interface ImmersiveLandingProps extends IComponentBaseProps {
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
  overlay?: JSX.Element | ((context: ImmersiveLandingContextValue) => JSX.Element);
  children: JSX.Element | ((context: ImmersiveLandingContextValue) => JSX.Element);
  pwaConfig?: PWAInstallPromptProps;
  cookieConfig?: CookieConsentProps;
  firefoxPWAConfig?: FirefoxPWABannerProps;
  showPWAPrompt?: boolean;
  showCookieConsent?: boolean;
  showFirefoxBanner?: boolean;
}

export interface ImmersiveLandingPageProps extends IComponentBaseProps {
  id: string;
  children: JSX.Element;
}

export interface ImmersiveLandingArrowsProps extends IComponentBaseProps {
  onPrev: () => void;
  onNext: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export interface ImmersiveLandingNavigationProps extends IComponentBaseProps {
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
  marketing: string;

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
  extensionUrl?: string;
  storageKey?: string;
  texts?: FirefoxPWABannerTexts;
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
  appName?: string;
  appIcon?: string;
  storageKey?: string;
  texts?: PWAInstallPromptTexts;
  onInstall?: () => void;
  onDismiss?: () => void;
}
