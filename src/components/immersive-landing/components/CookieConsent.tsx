import {
  type Component,
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  Show,
} from "solid-js";

import { ConsentType, CookieConsentProps } from "../types";
import Button from "../../button";
import Flex from "../../flex";

/**
 * CookieConsent Component
 *
 * Displays a fixed bottom banner on first visit to collect user cookie preferences.
 * Provides three options:
 * - Accept All: Enables all cookies (essential, analytics, marketing)
 * - Decline: Only essential cookies (analytics and marketing disabled)
 * - Manage: Opens modal to customize cookie preferences
 *
 * This component is brand-agnostic and fully configurable via props.
 *
 * @component
 *
 * @example
 * ```tsx
 * import { CookieConsent } from "@your-shared-library";
 * import { t } from "~/stores/i18nStore";
 *
 * export const App = () => {
 *   return (
 *     <main>
 *       <YourContent />
 *
 *       <CookieConsent
 *         storageKeys={{
 *           consentKey: "pays_cookie_consent",
 *           analyticsKey: "pays_cookie_analytics",
 *           marketingKey: "pays_cookie_marketing",
 *         }}
 *         texts={{
 *           message: t("common.cookies.message"),
 *           acceptAll: t("common.cookies.acceptAll"),
 *           decline: t("common.cookies.decline"),
 *           manage: t("common.cookies.manage"),
 *           manageTitle: t("common.cookies.manageTitle"),
 *           essential: t("common.cookies.essential"),
 *           analytics: t("common.cookies.analytics"),
 *           marketing: t("common.cookies.marketing"),
 *           cancel: t("common.cancel"),
 *           save: t("common.cookies.save"),
 *           closeLabel: t("common.close"),
 *         }}
 *         onConsentChange={(data) => {
 *           console.log("Consent changed:", data);
 *
 *           if (data.analytics) {
 *             enableAnalytics();
 *           }
 *         }}
 *       />
 *     </main>
 *   );
 * };
 * ```
 *
 * Storage Keys:
 * - consentKey: stores consent type ("all" | "essential" | "custom")
 * - analyticsKey: stores analytics preference ("true" | "false")
 * - marketingKey: stores marketing preference ("true" | "false")
 *
 * Accessibility:
 * - Banner: role="dialog", aria-modal="false"
 * - Modal: role="dialog", aria-modal="true"
 * - All interactive elements are keyboard accessible
 * - Uses semantic HTML and proper ARIA labels
 *
 * Performance:
 * - Only renders on first visit (checks localStorage)
 * - Smooth animations with CSS transitions
 * - Respects prefers-reduced-motion
 *
 * Events:
 * - onConsentChange(payload)
 *   payload = {
 *     type: "all" | "essential" | "custom",
 *     analytics: boolean,
 *     marketing: boolean
 *   }
 */

const defaultTexts = {
    message:
      "We use cookies to improve your experience. You can accept all cookies or manage your preferences.",
    acceptAll: "Accept all",
    decline: "Decline",
    manage: "Manage",
    manageTitle: "Manage cookie preferences",
    essential: "Essential (required)",
    analytics: "Analytics",
    marketing: "Marketing",
    cancel: "Cancel",
    save: "Save",
    closeLabel: "Close",
  };
  

export const CookieConsent: Component<CookieConsentProps> = (props) => {
  const [showBanner, setShowBanner] = createSignal(false);
  const [showManage, setShowManage] = createSignal(false);
  const [isClosing, setIsClosing] = createSignal(false);

  // Preference states for manage modal
  const [analyticsEnabled, setAnalyticsEnabled] = createSignal(false);
  const [marketingEnabled, setMarketingEnabled] = createSignal(false);

  const CONSENT_KEY = () =>
    props.storageKeys?.consentKey ?? "app_cookie_consent";
  
  const ANALYTICS_KEY = () =>
    props.storageKeys?.analyticsKey ?? "app_cookie_analytics";
  
  const MARKETING_KEY = () =>
    props.storageKeys?.marketingKey ?? "app_cookie_marketing";

  const texts = () => ({
    message: props.texts?.message ?? defaultTexts.message,
    acceptAll: props.texts?.acceptAll ?? defaultTexts.acceptAll,
    decline: props.texts?.decline ?? defaultTexts.decline,
    manage: props.texts?.manage ?? defaultTexts.manage,
    manageTitle: props.texts?.manageTitle ?? defaultTexts.manageTitle,
    essential: props.texts?.essential ?? defaultTexts.essential,
    analytics: props.texts?.analytics ?? defaultTexts.analytics,
    marketing: props.texts?.marketing ?? defaultTexts.marketing,
    cancel: props.texts?.cancel ?? defaultTexts.cancel,
    save: props.texts?.save ?? defaultTexts.save,
    closeLabel: props.texts?.closeLabel ?? defaultTexts.closeLabel,
  });
  
  

  const checkConsent = (): boolean => {
    const consent = localStorage.getItem(CONSENT_KEY());
    return !consent; // Show banner if no consent is stored
  };

  const saveConsent = (type: ConsentType) => {
    localStorage.setItem(CONSENT_KEY(), type);

    if (type === "all") {
      localStorage.setItem(ANALYTICS_KEY(), "true");
      localStorage.setItem(MARKETING_KEY(), "true");
    } else if (type === "essential") {
      localStorage.setItem(ANALYTICS_KEY(), "false");
      localStorage.setItem(MARKETING_KEY(), "false");
    }
    // "custom" is handled by the manage modal's save function
    emitChange(type);
  };

  const emitChange = (type: ConsentType) => {
    props.onConsentChange?.({
      type,
      analytics: localStorage.getItem(ANALYTICS_KEY()) === "true",
      marketing: localStorage.getItem(MARKETING_KEY()) === "true",
    });
  };

  const handleAcceptAll = () => {
    saveConsent("all");
    closeBanner();
  };

  const handleDecline = () => {
    saveConsent("essential");
    closeBanner();
  };

  const handleManageOpen = () => {
    // Load current preferences
    const analytics = localStorage.getItem(ANALYTICS_KEY()) === "true";
    const marketing = localStorage.getItem(MARKETING_KEY()) === "true";
    setAnalyticsEnabled(analytics);
    setMarketingEnabled(marketing);
    setShowManage(true);
  };

  const handleManageClose = () => {
    setShowManage(false);
  };

  const handleManageSave = () => {
    localStorage.setItem(CONSENT_KEY(), "custom");
    localStorage.setItem(ANALYTICS_KEY(), analyticsEnabled().toString());
    localStorage.setItem(MARKETING_KEY(), marketingEnabled().toString());
    setShowManage(false);
    closeBanner();
    emitChange("custom");
  };

  const closeBanner = () => {
    setIsClosing(true);
    // Wait for fade-out animation
    setTimeout(() => {
      setShowBanner(false);
      setIsClosing(false);
    }, 300);
  };

  // Handle escape key for manage modal
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && showManage()) {
      handleManageClose();
    }
  };

  onMount(() => {
    if (checkConsent()) {
      setShowBanner(true);
    }
    document.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <>
      {/* Cookie Consent Banner */}
      <Show when={showBanner()}>
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-message"
          class={`fixed bottom-0 left-0 right-0 z-52 bg-base-300/95 backdrop-blur border-t border-base-content/10 transition-all duration-300 ${
            isClosing()
              ? "translate-y-full opacity-0"
              : "translate-y-0 opacity-100 animate-slide-up"
          }`}
        >
          <div class="container mx-auto px-4 py-4 max-w-7xl">
            <Flex
              direction="col"
              gap="md"
              class="md:flex-row md:items-center md:justify-between"
            >
              <p
                id="cookie-consent-message"
                class="text-sm text-base-content flex-1"
              >
                {texts().message}
              </p>

              <Flex
                gap="sm"
                class="flex-col sm:flex-row sm:items-center shrink-0"
              >
                <Button
                  color="primary"
                  size="sm"
                  class="w-full sm:w-auto transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleAcceptAll}
                >
                  {texts().acceptAll}
                </Button>
                <Button
                  color="ghost"
                  size="sm"
                  class="w-full sm:w-auto"
                  onClick={handleDecline}
                >
                  {texts().decline}
                </Button>
                <button
                  type="button"
                  class="text-sm underline hover:no-underline text-base-content/70 hover:text-base-content transition-colors"
                  onClick={handleManageOpen}
                >
                  {texts().manage}
                </button>
              </Flex>
            </Flex>
          </div>
        </div>
      </Show>

      <Show when={showManage()}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-manage-title"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={handleManageClose}
        >
          <div
            class="bg-base-100 rounded-lg shadow-xl w-full max-w-md p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <Flex justify="between" align="center" class="mb-4">
              <h2 id="cookie-manage-title" class="text-lg font-semibold">
                {texts().manageTitle}
              </h2>
              <Button
                size="sm"
                color="ghost"
                shape="circle"
                onClick={handleManageClose}
                aria-label={texts().closeLabel}
              >
                X
              </Button>
            </Flex>

            <Flex direction="col" gap="md" class="mb-6">
              <label class="flex items-center justify-between p-3 rounded bg-base-200/50 cursor-not-allowed">
                <span class="text-sm font-medium text-base-content/70">
                  {texts().essential}
                </span>
                <input
                  type="checkbox"
                  checked
                  disabled
                  class="toggle toggle-sm toggle-primary"
                />
              </label>

              {/* Analytics */}
              <label class="flex items-center justify-between p-3 rounded hover:bg-base-200/50 cursor-pointer transition-colors">
                <span class="text-sm font-medium">{texts().analytics}</span>
                <input
                  type="checkbox"
                  checked={analyticsEnabled()}
                  onChange={(e) => setAnalyticsEnabled(e.currentTarget.checked)}
                  class="toggle toggle-sm toggle-primary"
                />
              </label>

              {/* Marketing */}
              <label class="flex items-center justify-between p-3 rounded hover:bg-base-200/50 cursor-pointer transition-colors">
                <span class="text-sm font-medium">{texts().marketing}</span>
                <input
                  type="checkbox"
                  checked={marketingEnabled()}
                  onChange={(e) => setMarketingEnabled(e.currentTarget.checked)}
                  class="toggle toggle-sm toggle-primary"
                />
              </label>
            </Flex>

            <Flex gap="sm" justify="end">
              <Button color="ghost" size="sm" onClick={handleManageClose}>
                {texts().cancel}
              </Button>
              <Button
                color="primary"
                size="sm"
                class="transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleManageSave}
              >
                {texts().save}
              </Button>
            </Flex>
          </div>
        </div>
      </Show>
    </>
  );
};
