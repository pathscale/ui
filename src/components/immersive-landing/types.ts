import type { JSX, Accessor } from "solid-js";
import type { IComponentBaseProps } from "../types";

export interface UseImmersiveLandingOptions {
  pages: readonly string[];
  initialPage?: string;
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
  transitionDuration?: number;
  onNavigate?: (fromPage: string, toPage: string) => void;
  onNavigationComplete?: (page: string) => void;
  enableScrollNavigation?: boolean;
  showNavigation?: boolean;
  showArrows?: boolean;
  appVersion?: string;
  overlay?: JSX.Element | ((context: ImmersiveLandingContextValue) => JSX.Element);
  children: JSX.Element | ((context: ImmersiveLandingContextValue) => JSX.Element);
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
